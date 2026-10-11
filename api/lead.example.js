// 참고용 폼 접수 핸들러 (Node 18+ / Vercel·Netlify·Cloudflare 스타일로 쉽게 이식 가능)
// 책임: 검증 → 허니팟/스팸 → lead_key 중복(409) → 저장 → { ok, lead_id } 응답.
// 실제 저장소(DB·시트·CRM)와 알림(이메일·슬랙)은 운영 환경에 맞게 연결합니다.
// 분석/전환은 클라이언트가 2xx 응답을 받은 뒤에만 lead_submit 으로 기록합니다 (docs/EVENTS.md).
'use strict';

const ALLOWED_UNITS = new Set(['studio', 'academy']);
const ALLOWED_LANGS = new Set(['ko', 'en', 'ja']);
const MAX = { name: 80, contact: 120, message: 1000, visit_date: 80 };

// 메모리 중복 방지 예시 — 운영에서는 DB unique index(lead_key)로 대체
const seenKeys = new Map();

function validate(d) {
  const errors = [];
  if (!d || typeof d !== 'object') return ['body'];
  if (d.website) errors.push('spam'); // 허니팟
  if (!ALLOWED_UNITS.has(d.business_unit)) errors.push('business_unit');
  if (!ALLOWED_LANGS.has(d.page_language)) errors.push('page_language');
  if (typeof d.name !== 'string' || d.name.trim().length < 2 || d.name.length > MAX.name) errors.push('name');
  if (typeof d.contact !== 'string' || d.contact.trim().length < 3 || d.contact.length > MAX.contact) errors.push('contact');
  if (d.consent_required !== true) errors.push('consent_required');
  if (!/^[0-9a-f-]{36}$/i.test(String(d.lead_key || ''))) errors.push('lead_key');
  if (d.business_unit === 'studio' && !d.service_interest) errors.push('service_interest');
  if (d.business_unit === 'academy' && (!d.experience_level || !d.course_interest)) errors.push('academy_fields');
  if (d.message && String(d.message).length > MAX.message) errors.push('message');
  return errors;
}

function normalize(d, req) {
  return {
    lead_key: d.lead_key,
    business_unit: d.business_unit,          // studio | academy
    page_language: d.page_language,          // 표시 언어
    preferred_language: d.preferred_language || '', // 희망 상담 언어 (표시 언어와 구분)
    name: d.name.trim(),
    contact: d.contact.trim(),
    service_interest: d.service_interest || '',
    has_previous: d.has_previous || '',
    visit_date: d.visit_date || '',
    experience_level: d.experience_level || '',
    course_interest: d.course_interest || '',
    start_timing: d.start_timing || '',
    message: d.message || '',
    consent_required: true,
    consent_marketing: d.consent_marketing === true,
    campaign_id: d.campaign_id || '',
    utm: { source: d.utm_source || '', medium: d.utm_medium || '', campaign: d.utm_campaign || '', content: d.utm_content || '', term: d.utm_term || '' },
    first_utm: { source: d.first_utm_source || '', medium: d.first_utm_medium || '', campaign: d.first_utm_campaign || '' },
    referrer: d.referrer || '',
    landing_path: d.landing_path || '',
    status: 'new',                           // new → contacted → consulted → booked/enrolled → visited/paid
    received_at: new Date().toISOString(),   // 서버 기준 (KST 표시는 조회 시 변환)
    user_agent: (req && req.headers && req.headers['user-agent']) || '',
  };
}

// 저장 어댑터 — 교체 지점
async function saveLead(lead) {
  // 예: await db.leads.insert(lead); await notify(lead);
  console.log('[lead]', JSON.stringify(lead));
  return { id: 'lead_' + lead.lead_key.slice(0, 8) };
}

async function handleLead(req, res) {
  const cors = { 'Access-Control-Allow-Origin': process.env.SITE_URL || '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  if (req.method !== 'POST') { res.writeHead(405, cors); return res.end('{"error":"method"}'); }

  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 20000) { res.writeHead(413, cors); return res.end('{"error":"too_large"}'); } }
  let d; try { d = JSON.parse(body); } catch { res.writeHead(400, cors); return res.end('{"error":"json"}'); }

  const errors = validate(d);
  if (errors.includes('spam')) { res.writeHead(200, cors); return res.end('{"ok":true}'); } // 봇에게는 조용히 성공처럼 응답, 저장 안 함
  if (errors.length) { res.writeHead(400, cors); return res.end(JSON.stringify({ error: 'invalid', fields: errors })); }

  if (seenKeys.has(d.lead_key)) { res.writeHead(409, cors); return res.end(JSON.stringify({ error: 'duplicate', lead_id: seenKeys.get(d.lead_key) })); }

  const lead = normalize(d, req);
  const saved = await saveLead(lead);
  seenKeys.set(d.lead_key, saved.id);
  res.writeHead(200, cors);
  res.end(JSON.stringify({ ok: true, lead_id: saved.id }));
}

module.exports = { handleLead, validate, normalize };

if (require.main === module) {
  require('http').createServer((req, res) => handleLead(req, res).catch((e) => { console.error(e); res.writeHead(500); res.end('{"error":"server"}'); }))
    .listen(process.env.PORT || 8787, () => console.log('lead endpoint on', process.env.PORT || 8787));
}
