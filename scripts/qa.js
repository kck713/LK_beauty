#!/usr/bin/env node
// 출시 QA 자동 검사 — dist/ 를 검사. 실패 시 exit 1.
// 검사: title/description/h1, canonical, hreflang(ko/en/ja/x-default, self-reference, 양방향), 내부 링크 유효성,
//       언어별 대응 페이지 존재, 누락 문구({…} 잔존), 미확정 배지 공개 노출, 사이트맵/robots, 폼 필수 필드, 개인정보 이벤트 금지 패턴.
'use strict';
const fs = require('fs');
const path = require('path');
const DIST = path.resolve(__dirname, '../dist');
const site = require('../content/site');
const LANGS = site.languages;
const problems = [];
const warns = [];
const fail = (f, m) => problems.push(`${f}: ${m}`);
const warn = (f, m) => warns.push(`${f}: ${m}`);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const files = walk(DIST).filter((f) => !f.includes(`${path.sep}admin${path.sep}`));
const rel = (f) => '/' + path.relative(DIST, f).replace(/\\/g, '/');
const urlOf = (f) => rel(f).replace(/index\.html$/, '');
const existsUrl = (u) => {
  const clean = u.split('#')[0].split('?')[0];
  if (!clean.startsWith('/')) return true;
  const p = path.join(DIST, clean);
  if (fs.existsSync(p)) return fs.statSync(p).isDirectory() ? fs.existsSync(path.join(p, 'index.html')) : true;
  return false;
};
const get = (html, re) => { const m = html.match(re); return m ? m[1] : null; };
const all = (html, re) => { const out = []; let m; while ((m = re.exec(html))) out.push(m); return out; };

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const r = rel(f);
  const u = urlOf(f);
  const is404 = /404\.html$/.test(r);
  const isRoot = r === '/index.html';

  if (html.includes('name="lk-fixtures"') && process.env.FIXTURES !== '1') fail(r, 'FIXTURES build must not be deployed');
  if (isRoot) { if (!/http-equiv="refresh" content="0; url=\/ko\/"/.test(html)) fail(r, 'root must redirect to /ko/'); if (!html.includes('noindex')) fail(r, 'root redirect page must be noindex'); continue; }
  if (!get(html, /<title>([^<]+)<\/title>/)) fail(r, 'missing <title>');
  if (!get(html, /<meta name="description" content="([^"]*)"/)) fail(r, 'missing meta description');
  const h1s = all(html, /<h1[^>]*>/g); if (h1s.length !== 1) fail(r, `expected 1 <h1>, found ${h1s.length}`);
  const lang = get(html, /<html lang="([^"]+)"/); if (!lang) fail(r, 'missing html lang');
  if (!isRoot && !is404) { const m = u.match(/^\/(ko|en|ja)\//); if (m && m[1] !== lang) fail(r, `html lang ${lang} != path lang ${m[1]}`); }

  const canonical = get(html, /<link rel="canonical" href="([^"]+)"/);
  if (!canonical) fail(r, 'missing canonical');
  else if (!is404 && canonical !== site.baseUrl + u) fail(r, `canonical ${canonical} != self ${site.baseUrl + u}`);

  const hl = all(html, /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g).map((m) => ({ lang: m[1], href: m[2] }));
  const hlLangs = hl.map((h) => h.lang).sort().join(',');
  if (!is404) {
    const isPost = /\/news\/[^/]+\/index\.html$/.test(r);
    const expected = ['x-default', ...LANGS].sort().join(',');
    if (!isPost && hlLangs !== expected) fail(r, `hreflang set = [${hlLangs}]`);
    if (isPost && (!hl.some((h) => h.lang === 'x-default') || hl.some((h) => !['x-default', ...LANGS].includes(h.lang)))) fail(r, `post hreflang set = [${hlLangs}]`);
    if (!isRoot && !hl.some((h) => h.href === canonical)) fail(r, 'hreflang lacks self-reference');
    for (const h of hl) {
      const target = h.href.replace(site.baseUrl, '');
      if (!existsUrl(target)) fail(r, `hreflang target missing: ${target}`);
      else if (h.lang !== 'x-default' && !isRoot) {
        // 양방향 검사
        const tf = path.join(DIST, target, 'index.html');
        const th = fs.readFileSync(tf, 'utf8');
        if (!th.includes(`hreflang="${lang}" href="${canonical}"`)) fail(r, `no return hreflang from ${target}`);
      }
    }
  }

  // 내부 링크
  for (const m of all(html, /\s(?:href|src|action)="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#|javascript:)/.test(href)) continue;
    if (href === '#') continue;
    if (!existsUrl(href)) {
      // 프리뷰 빌드에서는 아직 준비되지 않은 이미지 자산 참조를 경고로만 표시
      if (site.preview && /^\/images\//.test(href)) warn(r, `asset not ready (preview): ${href}`);
      else fail(r, `broken internal link: ${href}`);
    }
  }
  // 외부 링크: http 금지(https만), rel noopener
  for (const m of all(html, /<a [^>]*href="(http:[^"]+)"/g)) fail(r, `insecure http link ${m[1]}`);

  // 문구 누락
  for (const m of all(html, />[^<]*(\{\w+\})[^<]*</g)) fail(r, `unfilled placeholder ${m[1]}`);
  if (/undefined|\[object Object\]|NaN/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) fail(r, 'contains "undefined"/[object Object]/NaN');
  if (!site.preview && html.includes('badge-unverified')) fail(r, 'unverified badge exposed in public build');
  // 팝업은 상담·접수완료·개인정보 페이지에 없어야 함
  if (/\/(contact|privacy)\//.test(r) && html.includes('data-modal')) fail(r, 'entry modal must not render on contact/privacy pages');

  // 폼
  if (/\/contact\/index\.html$/.test(r)) {
    for (const id of ['studio-form', 'academy-form']) if (!html.includes(`id="${id}"`)) fail(r, `missing ${id}`);
    for (const n of ['business_unit', 'page_language', 'preferred_language', 'campaign_id', 'lead_key', 'consent_required']) if (!html.includes(`name="${n}"`)) fail(r, `form lacks field ${n}`);
    if (!html.includes('__LK_FORM_MESSAGES')) fail(r, 'form messages not injected');
    if (!site.form.endpoint) warn(r, 'FORM_ENDPOINT not set → forms show "preparing" notice');
  }
  // 접수 완료 페이지는 noindex
  if (/\/contact\/thanks\/index\.html$/.test(r) && !html.includes('noindex')) fail(r, 'thanks page must be noindex');
}

// 언어별 대응 페이지 존재
const slugs = ['', 'studio/', 'academy/', 'about/', 'contact/', 'privacy/', 'contact/thanks/'];
for (const l of LANGS) for (const s of slugs) if (!fs.existsSync(path.join(DIST, l, s, 'index.html'))) fail(`/${l}/${s}`, 'missing page');

// sitemap/robots
if (!fs.existsSync(path.join(DIST, 'sitemap.xml'))) fail('/sitemap.xml', 'missing');
else {
  const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  for (const m of all(sm, /<loc>([^<]+)<\/loc>/g)) { const t = m[1].replace(site.baseUrl, ''); if (!existsUrl(t)) fail('/sitemap.xml', `loc missing ${t}`); }
  if (sm.includes('/contact/thanks/')) fail('/sitemap.xml', 'thanks page must not be in sitemap');
}
if (!fs.existsSync(path.join(DIST, 'robots.txt'))) fail('/robots.txt', 'missing');
if (!fs.existsSync(path.join(DIST, '404.html'))) fail('/404.html', 'missing');

// 분석 스크립트에 개인정보 필드가 들어가지 않는지 (정적 검사)
const js = fs.readFileSync(path.join(DIST, 'assets/main.js'), 'utf8');
const trackCalls = all(js, /track\('lead_submit'[\s\S]*?\}\);/g).map((m) => m[0]);
for (const c of trackCalls) if (/\b(name|contact|message|visit_date)\b\s*:/.test(c)) fail('/assets/main.js', 'PII field in lead_submit event');

// 설정 경고
if (site.baseUrl.includes('.example')) warn('config', 'SITE_URL is a placeholder — set before launch');
if (!site.analytics.gtmId) warn('config', 'GTM_ID not set — events go to dataLayer only');

console.log(`QA: ${files.length} HTML files checked`);
warns.forEach((w) => console.log('  WARN ' + w));
problems.forEach((p) => console.log('  FAIL ' + p));
if (problems.length) { console.log(`QA FAILED (${problems.length})`); process.exit(1); }
console.log('QA PASSED');
