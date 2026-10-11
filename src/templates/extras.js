'use strict';
// 추가 모듈: 후기, 소식·이벤트, 시술/과정 상세, 진입 팝업
const { esc, attr, pagePath, show, badge, list, faq, steps } = require('./helpers');

const fmtDate = (iso, lang) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat({ ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' }[lang] || lang, { dateStyle: 'medium', ...(iso.includes('T') ? { timeStyle: 'short' } : {}), timeZone: 'Asia/Seoul' }).format(d) + (iso.includes('T') ? ' KST' : '');
  } catch { return iso; }
};

// ---------- 후기 ----------
function testimonialsSection({ site, t, lang, testimonials, unit }) {
  const items = testimonials.filter((x) => show(site, x) && (x.verified ? x.consent : true) && x.quote[lang] && (!unit || x.unit === unit));
  if (!items.length) return '';
  const tt = t.testimonials;
  return `
<section class="section section-alt" id="testimonials" aria-labelledby="testimonials-h">
  <div class="container">
    <h2 id="testimonials-h">${esc(tt.heading)}</h2>
    <p class="prose">${esc(tt.intro)}</p>
    <div class="testimonials">${items.map((x) => `
      <blockquote class="testimonial">
        <p>${esc(x.quote[lang])}</p>
        <footer><strong>${esc(x.displayName || tt.unit[x.unit])}</strong>${x.context[lang] ? ` · ${esc(x.context[lang])}` : ''}${x.compensated ? ` <span class="tag">${esc(tt.compensated)}</span>` : ''}${!x.verified ? badge(site, t) : ''}</footer>
      </blockquote>`).join('')}</div>
  </div>
</section>`;
}

// ---------- 소식 ----------
const postPublished = (site, p, lang) => show(site, p) && p.slug && p.slug[lang] && p.title[lang];
const postPath = (p, lang) => pagePath(lang, `news/${p.slug[lang]}`);

function postCard({ site, t, lang, p, ready }) {
  const n = t.news;
  const img = p.image && ready(p.image) ? `<img src="/${attr(p.image)}" alt="" loading="lazy" width="800" height="450">` : '';
  return `
  <a class="post-card" href="${postPath(p, lang)}">
    ${img ? `<div class="post-media">${img}</div>` : ''}
    <div class="post-body">
      <span class="kicker">${esc(n.types[p.type] || p.type)}${p.type === 'event' && p.event && p.event.startsAt ? ` · ${esc(fmtDate(p.event.startsAt, lang))}` : ''}</span>
      <span class="post-title">${esc(p.title[lang])}${!p.verified ? badge(site, t) : ''}</span>
      ${p.summary[lang] ? `<span class="post-summary">${esc(p.summary[lang])}</span>` : ''}
      <span class="post-more">${esc(n.readMore)} →</span>
    </div>
  </a>`;
}

function newsIndex({ site, t, lang, posts, ready }) {
  const n = t.news;
  const items = posts.filter((p) => postPublished(site, p, lang)).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  return `
<section class="hero hero-compact">
  <div class="container">
    <p class="eyebrow">${esc(t.common.nav.news)}</p>
    <h1>${esc(n.heading)}</h1>
    <p class="lead">${esc(n.sub)}</p>
  </div>
</section>
<section class="section">
  <div class="container">
    ${items.length ? `<div class="post-grid">${items.map((p) => postCard({ site, t, lang, p, ready })).join('')}</div>` : `<p class="prose">${esc(n.empty)}</p>`}
  </div>
</section>`;
}

function eventRegistrationForm({ site, t, lang, p }) {
  const c = t.contact; const f = c.fields; const n = t.news;
  const endpoint = site.form.endpoint;
  const o = c.options;
  return `
<form class="lead-form" id="event-form" method="post" action="${attr(endpoint || '#')}" novalidate data-lead-form data-unit="event" ${endpoint ? '' : 'data-no-endpoint'}>
  <input type="hidden" name="business_unit" value="event">
  <input type="hidden" name="event_id" value="${attr(p.id)}">
  <input type="hidden" name="page_language" value="${attr(lang)}">
  <input type="hidden" name="lead_key" value=""><input type="hidden" name="campaign_id" value="">
  <input type="hidden" name="utm_source" value=""><input type="hidden" name="utm_medium" value=""><input type="hidden" name="utm_campaign" value=""><input type="hidden" name="utm_content" value=""><input type="hidden" name="utm_term" value="">
  <input type="hidden" name="first_utm_source" value=""><input type="hidden" name="first_utm_medium" value=""><input type="hidden" name="first_utm_campaign" value="">
  <input type="hidden" name="referrer" value=""><input type="hidden" name="landing_path" value="">
  <div class="hp" aria-hidden="true"><label for="event-website">Website</label><input type="text" id="event-website" name="website" tabindex="-1" autocomplete="off"></div>
  <div class="field"><label for="event-name">${esc(f.name)} <span class="req" aria-hidden="true">*</span></label><input type="text" id="event-name" name="name" required aria-required="true" autocomplete="name" minlength="2" maxlength="80" aria-describedby="event-name-error"><p class="error" id="event-name-error" hidden></p></div>
  <div class="field"><label for="event-contact">${esc(f.contact)} <span class="req" aria-hidden="true">*</span></label><p class="hint" id="event-contact-hint">${esc(f.contactHint)}</p><input type="text" id="event-contact" name="contact" required aria-required="true" maxlength="120" aria-describedby="event-contact-hint event-contact-error"><p class="error" id="event-contact-error" hidden></p></div>
  <div class="field"><label for="event-lang">${esc(f.preferredLanguage)} <span class="req" aria-hidden="true">*</span></label><select id="event-lang" name="preferred_language" required aria-required="true" aria-describedby="event-lang-error"><option value="">${esc(f.select)}</option>${o.preferredLanguage.map((x) => `<option value="${attr(x.value)}">${esc(x.label)}</option>`).join('')}</select><p class="error" id="event-lang-error" hidden></p></div>
  <div class="field"><label for="event-message">${esc(f.message)}</label><textarea id="event-message" name="message" rows="3" maxlength="1000"></textarea><p class="error" id="event-message-error" hidden></p></div>
  <div class="field field-check"><input type="checkbox" id="event-consent-required" name="consent_required" value="yes" required aria-required="true" aria-describedby="event-consent-required-error"><label for="event-consent-required">${esc(f.consentRequired)} <a href="${pagePath(lang, 'privacy')}" target="_blank" rel="noopener">${esc(c.privacyNotice)}</a></label><p class="error" id="event-consent-required-error" hidden></p></div>
  <div class="field field-check"><input type="checkbox" id="event-consent-marketing" name="consent_marketing" value="yes"><label for="event-consent-marketing">${esc(f.consentMarketing)}</label></div>
  <p class="form-summary error" data-form-summary hidden role="alert"></p>
  <button class="btn btn-primary btn-lg" type="submit" data-submit-label="${attr(n.event.register)}" data-submitting-label="${attr(f.submitting)}">${esc(n.event.register)}</button>
  <p class="muted small">${esc(n.event.note)}</p>
</form>
<script>window.__LK_FORM_MESSAGES=${JSON.stringify(c.errors).replace(/</g, '\\u003c')};</script>`;
}

function postPage({ site, t, lang, p, ready }) {
  const n = t.news;
  const img = p.image && ready(p.image) ? `<div class="post-hero"><img src="/${attr(p.image)}" alt="" width="1600" height="900" fetchpriority="high"></div>` : '';
  let meta = '';
  let registration = '';
  if (p.type === 'event' && p.event) {
    const e = p.event;
    const open = !!e.registrationOpen;
    meta = `<dl class="kv kv-inline">
      ${e.startsAt ? `<div><dt>${esc(n.event.date)}</dt><dd>${esc(fmtDate(e.startsAt, lang))}${e.endsAt ? ` – ${esc(fmtDate(e.endsAt, lang))}` : ''}</dd></div>` : ''}
      ${e.location[lang] ? `<div><dt>${esc(n.event.location)}</dt><dd>${esc(e.location[lang])}</dd></div>` : ''}
      ${e.capacity ? `<div><dt>${esc(n.event.capacity)}</dt><dd>${esc(String(e.capacity))}${e.seatsLeft != null ? ` · ${esc(n.event.seatsLeft)} ${esc(String(e.seatsLeft))}` : ''}</dd></div>` : ''}
      <div><dt>${esc(n.event.register)}</dt><dd><span class="tag">${esc(open ? n.event.open : n.event.closed)}</span></dd></div>
    </dl>`;
    registration = open ? `<section class="section section-alt" id="register" aria-labelledby="register-h"><div class="container"><h2 id="register-h">${esc(n.event.registrationHeading)}</h2><div class="tabs">${eventRegistrationForm({ site, t, lang, p })}</div></div></section>` : '';
  }
  if (p.type === 'promotion' && p.promotion) {
    meta = `<dl class="kv kv-inline">${p.promotion.validUntil ? `<div><dt>${esc(n.promotion.validUntil)}</dt><dd>~ ${esc(fmtDate(p.promotion.validUntil, lang))}</dd></div>` : ''}</dl>`;
    const terms = (p.promotion.terms && p.promotion.terms[lang]) || [];
    if (terms.length) registration = `<section class="section section-alt"><div class="container"><h2>${esc(n.promotion.terms)}</h2>${list(terms, 'notes')}</div></section>`;
  }
  return `
<article>
<section class="hero hero-compact">
  <div class="container">
    <p class="eyebrow">${esc(n.types[p.type] || p.type)}</p>
    <h1>${esc(p.title[lang])}${!p.verified ? badge(site, t) : ''}</h1>
    ${p.summary[lang] ? `<p class="lead">${esc(p.summary[lang])}</p>` : ''}
    ${meta}
  </div>
</section>
<section class="section">
  <div class="container prose-block">
    ${img}
    ${(p.body[lang] || []).map((para) => `<p>${esc(para)}</p>`).join('')}
    <p class="muted small">${esc(n.publishedAt)}: ${esc(fmtDate(p.publishedAt, lang))}</p>
    <p><a class="btn btn-secondary" href="${pagePath(lang, 'news')}">${esc(n.backToList)}</a></p>
  </div>
</section>
${registration}
</article>`;
}

// ---------- 시술 / 과정 상세 ----------
const detailReady = (site, item, langs) => show(site, item) && item.slug && langs.every((l) => item.slug[l] && item.detail && item.detail[l] && item.detail[l].intro);

function serviceDetail({ site, t, lang, sv }) {
  const d = sv.detail[lang]; const dt = t.detail; const s = t.studio;
  const contactHref = pagePath(lang, 'contact') + '#studio';
  return `
<section class="hero hero-compact">
  <div class="container">
    <p class="eyebrow">${esc(t.common.nav.studio)}</p>
    <h1>${esc(sv.name[lang])}${!sv.verified ? badge(site, t) : ''}</h1>
    <p class="lead">${esc(d.intro)}</p>
    <div class="hero-actions"><a class="btn btn-primary" href="${contactHref}" data-cta="hero-primary" data-unit="studio">${esc(dt.inquiry)}</a></div>
  </div>
</section>
${d.forWhom && d.forWhom.length ? `<section class="section"><div class="container"><h2>${esc(dt.forWhom)}</h2>${list(d.forWhom, 'checklist')}</div></section>` : ''}
${d.process && d.process.length ? `<section class="section section-alt"><div class="container"><h2>${esc(dt.process)}</h2>${steps(d.process.map((x) => typeof x === 'string' ? { title: x, desc: '' } : x))}</div></section>` : ''}
<section class="section"><div class="container"><h2>${esc(s.pricing.heading)}</h2>
  ${sv.priceKRW ? `<p class="prose"><strong>${esc(s.services.priceLabel)}:</strong> ₩${Number(sv.priceKRW).toLocaleString('en-US')} (KRW)</p>` : `<p class="prose">${esc(s.pricing.body)}</p>`}
  ${sv.retouchTerms[lang] ? `<p class="prose"><strong>${esc(s.services.retouchLabel)}:</strong> ${esc(sv.retouchTerms[lang])}</p>` : ''}
  <p class="prose muted small">${esc(dt.priceNote)}</p></div></section>
${d.aftercare && d.aftercare.length ? `<section class="section section-alt"><div class="container"><h2>${esc(dt.aftercare)}</h2>${list(d.aftercare, 'notes')}</div></section>` : ''}
${d.faq && d.faq.length ? faq(d.faq, t.common.faqHeading) : ''}
<section class="cta-band"><div class="container"><h2>${esc(s.ctaBand.heading)}</h2><p>${esc(s.ctaBand.desc)}</p><a class="btn btn-primary btn-lg" href="${contactHref}" data-cta="band" data-unit="studio">${esc(dt.inquiry)}</a> <a class="btn btn-secondary btn-lg" href="${pagePath(lang, 'studio')}">${esc(dt.backToStudio)}</a></div></section>`;
}

function courseDetail({ site, t, lang, c }) {
  const d = c.detail[lang]; const dt = t.detail; const a = t.academy;
  const contactHref = pagePath(lang, 'contact') + '#academy';
  const facts = [
    c.duration[lang] ? [a.courses.duration, c.duration[lang]] : null,
    c.schedule[lang] ? [a.courses.schedule, c.schedule[lang]] : null,
    c.capacity ? [a.courses.capacity, String(c.capacity)] : null,
    c.priceKRW ? [a.courses.price, '₩' + Number(c.priceKRW).toLocaleString('en-US') + ' (KRW)'] : null,
  ].filter(Boolean);
  return `
<section class="hero hero-compact">
  <div class="container">
    <p class="eyebrow">${esc(t.common.nav.academy)}</p>
    <h1>${esc(c.name[lang])}${!c.verified ? badge(site, t) : ''}</h1>
    <p class="lead">${esc(d.intro)}</p>
    ${facts.length ? `<dl class="kv kv-inline">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    <div class="hero-actions"><a class="btn btn-primary" href="${contactHref}" data-cta="hero-primary" data-unit="academy">${esc(dt.courseInquiry)}</a></div>
  </div>
</section>
${d.forWhom && d.forWhom.length ? `<section class="section"><div class="container"><h2>${esc(dt.forWhom)}</h2>${list(d.forWhom, 'checklist')}</div></section>` : ''}
${d.process && d.process.length ? `<section class="section section-alt"><div class="container"><h2>${esc(dt.process)}</h2>${steps(d.process.map((x) => typeof x === 'string' ? { title: x, desc: '' } : x))}</div></section>` : ''}
${c.includes[lang].length ? `<section class="section"><div class="container"><h2>${esc(dt.includes)}</h2>${list(c.includes[lang], 'notes')}</div></section>` : ''}
${c.outcomes[lang].length ? `<section class="section section-alt"><div class="container"><h2>${esc(dt.outcomes)}</h2>${list(c.outcomes[lang], 'notes')}</div></section>` : ''}
${d.faq && d.faq.length ? faq(d.faq, t.common.faqHeading) : ''}
<section class="cta-band"><div class="container"><h2>${esc(a.ctaBand.heading)}</h2><p>${esc(a.ctaBand.desc)}</p><a class="btn btn-primary btn-lg" href="${contactHref}" data-cta="band" data-unit="academy">${esc(dt.courseInquiry)}</a> <a class="btn btn-secondary btn-lg" href="${pagePath(lang, 'academy')}">${esc(dt.backToAcademy)}</a></div></section>`;
}

// ---------- 진입 팝업 (활성 게시물 1개) ----------
function activeModalPost(site, posts, now = new Date()) {
  return posts.find((p) => show(site, p) && p.modal && p.modal.enabled && (!p.modal.from || new Date(p.modal.from) <= now) && (!p.modal.until || now <= new Date(p.modal.until + (p.modal.until.length <= 10 ? 'T23:59:59+09:00' : '')))) || null;
}

function modal({ site, t, lang, p, ready }) {
  if (!p || !postPublished(site, p, lang)) return '';
  const m = t.modal; const f = t.contact.fields; const c = t.contact;
  const endpoint = site.form.endpoint;
  const img = p.image && ready(p.image) ? `<img src="/${attr(p.image)}" alt="" width="1600" height="900" loading="eager">` : '';
  const o = c.options;
  const until = p.modal.until || '';
  return `
<div class="modal" id="lk-modal" role="dialog" aria-modal="true" aria-labelledby="lk-modal-title" hidden data-modal data-modal-id="${attr(p.id)}" data-modal-until="${attr(until)}">
  <div class="modal-backdrop" data-modal-close></div>
  <div class="modal-panel">
    <button type="button" class="modal-close" aria-label="${attr(m.close)}" data-modal-close>×</button>
    ${img ? `<div class="modal-media">${img}</div>` : ''}
    <div class="modal-body">
      <p class="kicker">${esc(t.news.types[p.type] || p.type)}${p.event && p.event.startsAt ? ` · ${esc(fmtDate(p.event.startsAt, lang))}` : ''}</p>
      <h2 id="lk-modal-title">${esc(p.title[lang])}${!p.verified ? badge(site, t) : ''}</h2>
      ${p.summary[lang] ? `<p class="muted">${esc(p.summary[lang])}</p>` : ''}
      <form class="lead-form modal-form" method="post" action="${attr(endpoint || '#')}" novalidate data-lead-form data-unit="event" ${endpoint ? '' : 'data-no-endpoint'}>
        <input type="hidden" name="business_unit" value="event"><input type="hidden" name="event_id" value="${attr(p.id)}"><input type="hidden" name="page_language" value="${attr(lang)}">
        <input type="hidden" name="lead_key" value=""><input type="hidden" name="campaign_id" value=""><input type="hidden" name="utm_source" value=""><input type="hidden" name="utm_medium" value=""><input type="hidden" name="utm_campaign" value=""><input type="hidden" name="utm_content" value=""><input type="hidden" name="utm_term" value=""><input type="hidden" name="first_utm_source" value=""><input type="hidden" name="first_utm_medium" value=""><input type="hidden" name="first_utm_campaign" value=""><input type="hidden" name="referrer" value=""><input type="hidden" name="landing_path" value="">
        <input type="hidden" name="preferred_language" value="${attr(lang)}">
        <div class="hp" aria-hidden="true"><label for="modal-website">Website</label><input type="text" id="modal-website" name="website" tabindex="-1" autocomplete="off"></div>
        <h3 class="panel-title">${esc(m.formHeading)}</h3>
        <div class="field"><label for="modal-name">${esc(f.name)} <span class="req" aria-hidden="true">*</span></label><input type="text" id="modal-name" name="name" required aria-required="true" autocomplete="name" minlength="2" maxlength="80" aria-describedby="modal-name-error"><p class="error" id="modal-name-error" hidden></p></div>
        <div class="field"><label for="modal-contact">${esc(f.contact)} <span class="req" aria-hidden="true">*</span></label><input type="text" id="modal-contact" name="contact" required aria-required="true" maxlength="120" aria-describedby="modal-contact-error"><p class="error" id="modal-contact-error" hidden></p></div>
        <div class="field field-check"><input type="checkbox" id="modal-consent-required" name="consent_required" value="yes" required aria-required="true" aria-describedby="modal-consent-required-error"><label for="modal-consent-required">${esc(f.consentRequired)} <a href="${pagePath(lang, 'privacy')}" target="_blank" rel="noopener">${esc(c.privacyNotice)}</a></label><p class="error" id="modal-consent-required-error" hidden></p></div>
        <p class="form-summary error" data-form-summary hidden role="alert"></p>
        <button class="btn btn-primary" type="submit" data-submit-label="${attr(m.submit)}" data-submitting-label="${attr(f.submitting)}">${esc(m.submit)}</button>
        <p class="muted small">${esc(m.note)}</p>
      </form>
      <div class="modal-actions">
        <a href="${postPath(p, lang)}" data-cta="modal-detail" data-unit="event">${esc(m.detail)}</a>
        <button type="button" class="link-btn" data-modal-dismiss-today>${esc(m.dismissToday)}</button>
      </div>
    </div>
  </div>
</div>
<script>window.__LK_FORM_MESSAGES=window.__LK_FORM_MESSAGES||${JSON.stringify(c.errors).replace(/</g, '\\u003c')};</script>`;
}

module.exports = { testimonialsSection, newsIndex, postPage, postPublished, postPath, serviceDetail, courseDetail, detailReady, activeModalPost, modal, fmtDate };
