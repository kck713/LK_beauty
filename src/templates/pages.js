'use strict';
const { esc, attr, rich, pagePath, show, badge, list, cards, faq, steps } = require('./helpers');
const { testimonialsSection, detailReady, spaceSection } = require('./extras');

// ---------- 공통 조각 ----------

function hero(t, h, { eyebrow, heading, sub, primary, secondary, unit, media, cover }) {
  const isCover = !!(cover && media);
  return `
<section class="hero hero-${attr(unit || 'brand')}${isCover ? ' hero-cover' : media ? ' hero-with-media' : primary ? ' hero-editorial' : ''}">
  <div class="container">
    ${media ? `<div class="hero-media"><picture>${media.webp ? `<source type="image/webp" srcset="/${attr(media.webp)}">` : ''}<img src="/${attr(media.src)}" alt="${attr(media.alt)}" width="${media.width || 1200}" height="${media.height || 900}" fetchpriority="high"></picture></div>` : primary ? `<div class="hero-signature" aria-hidden="true"><span class="signature-index">LK BeautyAxis</span><span class="signature-monogram">LKBA<span>Beauty begins with an Axis</span></span><span class="signature-foot">${unit === 'studio' ? 'STUDIO' : unit === 'academy' ? 'ACADEMY' : 'STUDIO & ACADEMY'}<span>SEOUL</span></span></div>` : ''}
    <div class="hero-copy">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h1>${rich(heading)}</h1>
      ${sub ? `<p class="lead">${esc(sub)}</p>` : ''}
      ${(primary || secondary) ? `<div class="hero-actions">
        ${primary ? `<a class="btn btn-primary" href="${attr(primary.href)}" data-cta="hero-primary" data-unit="${attr(unit || 'brand')}">${esc(primary.label)}</a>` : ''}
        ${secondary ? `<a class="btn btn-secondary" href="${attr(secondary.href)}" data-cta="hero-secondary" data-unit="${attr(unit || 'brand')}">${esc(secondary.label)}</a>` : ''}
      </div>` : ''}
    </div>
  </div>
</section>`;
}

// 준비된 이미지 자산만 히어로에 사용 (없으면 타이포 중심 히어로)
function heroMedia(ready, rel, alt, dims) {
  if (!(ready && ready(rel))) return null;
  const webp = rel.replace(/\.jpe?g$/i, '.webp');
  return { src: rel, alt, webp: ready(webp) ? webp : null, width: dims && dims[0], height: dims && dims[1] };
}

function section(id, heading, inner, extraCls = '') {
  return `
<section class="section ${extraCls}" id="${attr(id)}" aria-labelledby="${attr(id)}-h">
  <div class="container">
    <h2 id="${attr(id)}-h">${rich(heading)}</h2>
    ${inner}
  </div>
</section>`;
}

function ctaBand(c, href, unit) {
  return `
<section class="cta-band">
  <div class="container">
    <h2>${rich(c.heading)}</h2>
    <p>${esc(c.desc)}</p>
    <a class="btn btn-primary btn-lg" href="${attr(href)}" data-cta="band" data-unit="${attr(unit)}">${esc(c.cta)}</a>
  </div>
</section>`;
}

function languageSupportBlock(site, t, lang) {
  const sl = site.supportLanguages;
  let body;
  if (sl.verified && sl.note[lang]) body = sl.note[lang];
  else body = t.common.languageSupportPending;
  return `<div class="notice"><p>${esc(body)}</p>${!sl.verified ? badge(site, t) : ''}</div>`;
}

function locationBlock(site, t, lang) {
  const a = site.address;
  const addr = a.verified ? a.full[lang] : a.area[lang];
  const hours = site.hours.verified && site.hours[lang] ? site.hours[lang] : t.common.hoursPending;
  return `
<div class="location">
  <dl class="kv">
    <div><dt>${esc(t.common.locationLabel)}</dt><dd>${esc(addr)}${!a.verified ? ` <span class="muted">${esc(t.common.addressPending)}</span>${badge(site, t)}` : ''}${a.mapUrl ? ` <a href="${attr(a.mapUrl)}" target="_blank" rel="noopener" data-contact="map">Map</a>` : ''}</dd></div>
    <div><dt>${esc(t.common.hoursLabel)}</dt><dd>${esc(hours)}${!site.hours.verified ? badge(site, t) : ''}</dd></div>
  </dl>
  <p class="muted small">${esc(t.common.kstNote)}</p>
  ${a.verified && a.mapEmbedUrl ? `<div class="map-embed"><iframe src="${attr(a.mapEmbedUrl)}" title="${attr(t.common.locationLabel)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : ''}
</div>`;
}

function channelsList(site, t, { includeInstagram = true } = {}) {
  const c = site.channels;
  const items = [];
  if (includeInstagram && c.instagram.verified) items.push(`<li><a href="${attr(c.instagram.url)}" target="_blank" rel="me noopener" data-contact="instagram">${esc(t.common.instagram)} ${esc(c.instagram.label)}</a></li>`);
  if (show(site, c.kakao) && c.kakao.url) items.push(`<li><a href="${attr(c.kakao.url)}" target="_blank" rel="noopener" data-contact="kakao">${esc(t.common.kakao)}</a>${!c.kakao.verified ? badge(site, t) : ''}</li>`);
  if (show(site, c.email) && c.email.address) items.push(`<li><a href="mailto:${attr(c.email.address)}" data-contact="email">${esc(t.common.email)}: ${esc(c.email.address)}</a></li>`);
  if (show(site, c.phone) && c.phone.number) items.push(`<li><a href="tel:${attr(c.phone.number)}" data-contact="phone">${esc(t.common.phone)}: ${esc(c.phone.display || c.phone.number)}</a></li>`);
  if (show(site, c.whatsapp) && c.whatsapp.url) items.push(`<li><a href="${attr(c.whatsapp.url)}" target="_blank" rel="noopener" data-contact="whatsapp">${esc(t.common.whatsapp)}</a></li>`);
  if (show(site, c.line) && c.line.url) items.push(`<li><a href="${attr(c.line.url)}" target="_blank" rel="noopener" data-contact="line">${esc(t.common.line)}</a></li>`);
  return items.length ? `<ul class="channels">${items.join('')}</ul>` : '';
}

// ---------- 페이지 ----------

function home({ site, t, lang, ready }) {
  const h = t.home;
  const chooseCard = (key) => {
    const c = h.choose[key];
    return `
    <a class="choice-card choice-${key}" href="${pagePath(lang, key)}" data-cta="home-choice" data-unit="${key}">
      <span class="choice-top"><span class="choice-kicker">${esc(t.common.nav[key])}</span><span class="choice-number" aria-hidden="true">${key === 'studio' ? '01' : '02'}</span></span>
      <span class="choice-title">${rich(c.title)}</span>
      <span class="choice-desc">${esc(c.desc)}</span>
      <span class="choice-cta">${esc(c.cta)}<span aria-hidden="true">↗</span></span>
    </a>`;
  };
  return hero(t, h, {
    eyebrow: h.hero.eyebrow, heading: h.hero.heading, sub: h.hero.sub, unit: 'brand', cover: true, media: heroMedia(ready, 'images/home/hero.jpg', h.hero.imageAlt, [1600, 897]),
    primary: { href: pagePath(lang, h.choose.order[0]), label: h.choose.order[0] === 'academy' ? h.hero.ctaAcademy : h.hero.ctaStudio },
    secondary: { href: pagePath(lang, h.choose.order[1]), label: h.choose.order[1] === 'academy' ? h.hero.ctaAcademy : h.hero.ctaStudio },
  })
  + section('choose', h.choose.heading, `<div class="choices">${h.choose.order.map(chooseCard).join('')}</div>`)
  + section('principle', h.principle.heading, h.principle.paragraphs.map((p) => `<p class="prose">${esc(p)}</p>`).join(''), 'section-alt')
  + section('connection', h.connection.heading, cards(h.connection.items))
  + section('location', h.location.heading, `<p class="prose">${esc(h.location.desc)}</p>${locationBlock(site, t, lang)}<p><a class="btn btn-primary" href="${pagePath(lang, 'contact')}" data-cta="home-location" data-unit="brand">${esc(h.location.cta)}</a></p>`, 'section-alt');
}

function studio({ site, t, lang, studio: data, ready, testimonials }) {
  const s = t.studio;
  const contactHref = pagePath(lang, 'contact') + '#studio';
  const cases = data.cases.filter((c) => show(site, c) && (c.verified ? c.consent : true));
  const services = data.services.filter((c) => show(site, c));

  const casesHtml = cases.length ? `<p class="prose">${esc(s.cases.intro)}</p><div class="cases">${cases.map((c) => `
    <figure class="case">
      <img src="/${attr(c.image)}" alt="${attr(c.alt[lang] || '')}" loading="lazy" width="800" height="600">
      <figcaption>
        <span class="tag">${esc(s.cases.stage[c.stage] || c.stage)}</span>${c.takenAt ? ` <span class="muted">${esc(s.cases.takenAt)} ${esc(c.takenAt)}</span>` : ''}
        ${c.reason[lang] ? `<p><strong>${esc(s.cases.reasonLabel)}:</strong> ${esc(c.reason[lang])}</p>` : ''}
        ${!c.verified ? badge(site, t) : ''}
      </figcaption>
    </figure>`).join('')}</div>` : '';

  const servicesHtml = services.length ? `<div class="cards">${services.map((sv) => `
    <div class="card">
      <h3 class="card-title">${detailReady(site, sv, site.languages) ? `<a href="${pagePath(lang, 'studio/' + sv.slug[lang])}">${esc(sv.name[lang])}</a>` : esc(sv.name[lang])}${!sv.verified ? badge(site, t) : ''}</h3>
      ${sv.summary[lang] ? `<p class="card-desc">${esc(sv.summary[lang])}</p>` : ''}
      ${sv.priceKRW ? `<p class="card-meta">${esc(s.services.priceLabel)}: ₩${Number(sv.priceKRW).toLocaleString('en-US')} (KRW)</p>` : ''}
      ${sv.retouchTerms[lang] ? `<p class="card-meta">${esc(s.services.retouchLabel)}: ${esc(sv.retouchTerms[lang])}</p>` : ''}
    </div>`).join('')}</div>` : `<p class="prose">${esc(s.services.pending)}</p>`;

  return hero(t, s, {
    eyebrow: s.hero.eyebrow, heading: s.hero.heading, sub: s.hero.sub, unit: 'studio', media: heroMedia(ready, 'images/studio/hero.jpg', s.hero.imageAlt, [1200, 1500]),
    primary: { href: contactHref, label: s.hero.ctaPrimary },
    secondary: { href: '#process', label: s.hero.ctaSecondary },
  })
  + section('concerns', s.concerns.heading, list(s.concerns.items, 'checklist'))
  + (casesHtml ? section('cases', s.cases.heading, casesHtml, 'section-alt') : '')
  + section('design', s.designReason.heading, cards(s.designReason.items), casesHtml ? '' : 'section-alt')
  + section('services', s.services.heading, servicesHtml)
  + section('language', s.languageSupport.heading, languageSupportBlock(site, t, lang), 'section-alt')
  + section('pricing', s.pricing.heading, `<p class="prose">${esc(s.pricing.body)}</p>${list(s.pricing.notes, 'notes')}`)
  + section('process', s.process.heading, steps(s.process.steps), 'section-alt')
  + section('visit', s.visit.heading, `<p class="prose">${esc(s.visit.body)}</p><h3>${esc(s.visit.afterHeading)}</h3><p class="prose">${esc(s.visit.afterBody)}</p>`)
  + testimonialsSection({ site, t, lang, testimonials, unit: 'studio' })
  + spaceSection({ site, t, lang, ready, compact: true })
  + faq(s.faq.items, t.common.faqHeading)
  + section('location', s.location.heading, locationBlock(site, t, lang), 'section-alt')
  + ctaBand(s.ctaBand, contactHref, 'studio');
}

function academy({ site, t, lang, academy: data, ready, testimonials }) {
  const a = t.academy;
  const contactHref = pagePath(lang, 'contact') + '#academy';
  const courses = data.courses.filter((c) => show(site, c));
  const videos = data.coachingVideos.filter((v) => show(site, v) && v.src);
  const growth = data.growthCases.filter((g) => show(site, g) && (g.verified ? g.consent : true));
  const instructors = data.instructors.filter((i) => show(site, i));
  const curriculum = show(site, data.curriculum) && data.curriculum.steps[lang].length ? data.curriculum.steps[lang] : null;
  const support = show(site, data.postCompletionSupport) && data.postCompletionSupport[lang].length ? data.postCompletionSupport[lang] : null;

  const videosHtml = videos.length ? `<div class="videos">${videos.map((v) => `
    <figure class="video">
      <video controls preload="none" poster="/${attr(v.poster)}" playsinline><source src="/${attr(v.src)}"></video>
      <figcaption>${esc(v.caption[lang] || '')}${!v.verified ? badge(site, t) : ''}</figcaption>
    </figure>`).join('')}</div>` : '';

  const coursesHtml = courses.length ? `<div class="table-wrap"><table class="table">
    <thead><tr><th scope="col"></th>${courses.map((c) => `<th scope="col">${detailReady(site, c, site.languages) ? `<a href="${pagePath(lang, 'academy/' + c.slug[lang])}">${esc(c.name[lang])}</a>` : esc(c.name[lang])}${!c.verified ? badge(site, t) : ''}</th>`).join('')}</tr></thead>
    <tbody>
      <tr><th scope="row">${esc(a.courses.duration)}</th>${courses.map((c) => `<td>${esc(c.duration[lang])}</td>`).join('')}</tr>
      <tr><th scope="row">${esc(a.courses.schedule)}</th>${courses.map((c) => `<td>${esc(c.schedule[lang])}</td>`).join('')}</tr>
      <tr><th scope="row">${esc(a.courses.capacity)}</th>${courses.map((c) => `<td>${c.capacity ?? ''}</td>`).join('')}</tr>
      <tr><th scope="row">${esc(a.courses.price)}</th>${courses.map((c) => `<td>${c.priceKRW ? '₩' + Number(c.priceKRW).toLocaleString('en-US') + ' (KRW)' : ''}</td>`).join('')}</tr>
      <tr><th scope="row">${esc(a.courses.includes)}</th>${courses.map((c) => `<td>${c.includes[lang].length ? list(c.includes[lang]) : ''}</td>`).join('')}</tr>
    </tbody></table></div>` : `<p class="prose">${esc(a.courses.pending)}</p>`;

  const growthHtml = growth.length ? `<p class="prose">${esc(a.growth.intro)}</p><div class="growth">${growth.map((g) => `
    <figure class="growth-case">
      <div class="growth-pair">
        <div><img src="/${attr(g.before)}" alt="${attr(a.growth.before)}" loading="lazy" width="600" height="450"><span class="tag">${esc(a.growth.before)}${g.beforeTakenAt ? ' · ' + esc(g.beforeTakenAt) : ''}</span></div>
        <div><img src="/${attr(g.after)}" alt="${attr(a.growth.after)}" loading="lazy" width="600" height="450"><span class="tag">${esc(a.growth.after)}${g.afterTakenAt ? ' · ' + esc(g.afterTakenAt) : ''}</span></div>
      </div>
      <figcaption>${esc(g.priorExperience[lang] || '')}${g.course ? ' · ' + esc(g.course) : ''} · ${esc(g.supervised ? a.growth.supervised : a.growth.independent)}${g.note[lang] ? `<br>${esc(g.note[lang])}` : ''}${!g.verified ? badge(site, t) : ''}</figcaption>
    </figure>`).join('')}</div>` : '';

  const instructorsHtml = instructors.length ? `<div class="cards">${instructors.map((i) => `
    <div class="card">
      <h3 class="card-title">${esc(i.name[lang] || i.role[lang])}${!i.verified ? badge(site, t) : ''}</h3>
      <p class="card-meta">${esc(i.role[lang])}</p>
      ${i.credentials[lang].length ? list(i.credentials[lang]) : ''}
    </div>`).join('')}</div>` : '';

  return hero(t, a, {
    eyebrow: a.hero.eyebrow, heading: a.hero.heading, sub: a.hero.sub, unit: 'academy', media: heroMedia(ready, 'images/academy/hero.jpg', a.hero.imageAlt, [1600, 900]),
    primary: { href: contactHref, label: a.hero.ctaPrimary },
    secondary: { href: '#tracks', label: a.hero.ctaSecondary },
  })
  + section('tracks', a.tracks.heading, cards(a.tracks.items))
  + section('coaching', a.coaching.heading, `<p class="prose">${esc(a.coaching.body)}</p>${cards(a.coaching.items)}${videosHtml}`, 'section-alt')
  + (curriculum ? section('curriculum', a.curriculum.heading, `<ol class="steps">${curriculum.map((s) => `<li class="step"><strong>${esc(s)}</strong></li>`).join('')}</ol>`) : '')
  + (growthHtml ? section('growth', a.growth.heading, growthHtml) : '')
  + (instructorsHtml ? section('instructors', a.instructors.heading, instructorsHtml, 'section-alt') : '')
  + section('courses', a.courses.heading, coursesHtml)
  + (support ? section('support', a.support.heading, list(support), 'section-alt') : '')
  + section('language', t.studio.languageSupport.heading, languageSupportBlock(site, t, lang), 'section-alt')
  + testimonialsSection({ site, t, lang, testimonials, unit: 'academy' })
  + faq(a.faq.items, t.common.faqHeading)
  + ctaBand(a.ctaBand, contactHref, 'academy');
}

function about({ site, t, lang, academy: data, testimonials, ready }) {
  const ab = t.about;
  const director = data.instructors.find((i) => i.id === 'director');
  const directorHtml = show(site, director) && (director.name[lang] || director.credentials[lang].length)
    ? section('director', ab.director.heading, `<div class="card"><h3 class="card-title">${esc(director.name[lang] || director.role[lang])}${!director.verified ? badge(site, t) : ''}</h3>${director.credentials[lang].length ? list(director.credentials[lang]) : ''}</div>`)
    : '';
  return hero(t, ab, { eyebrow: ab.hero.eyebrow, heading: ab.hero.heading, unit: 'brand' })
  + section('story', ab.hero.heading, ab.paragraphs.map((p) => `<p class="prose">${esc(p)}</p>`).join(''), 'sr-heading')
  + section('principles', ab.principles.heading, cards(ab.principles.items), 'section-alt')
  + section('operations', ab.operations.heading, list(ab.operations.items, 'notes'))
  + spaceSection({ site, t, lang, ready, compact: false })
  + directorHtml
  + testimonialsSection({ site, t, lang, testimonials, unit: null })
  + section('channels', ab.channels.heading, channelsList(site, t) + locationBlock(site, t, lang), 'section-alt');
}

function field({ id, label, hint, required, input }) {
  return `
<div class="field">
  <label for="${attr(id)}">${esc(label)}${required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
  ${hint ? `<p class="hint" id="${attr(id)}-hint">${esc(hint)}</p>` : ''}
  ${input}
  <p class="error" id="${attr(id)}-error" hidden></p>
</div>`;
}

function selectInput(id, name, options, placeholder, required) {
  return `<select id="${attr(id)}" name="${attr(name)}"${required ? ' required aria-required="true"' : ''} aria-describedby="${attr(id)}-error">
    <option value="">${esc(placeholder)}</option>
    ${options.map((o) => `<option value="${attr(o.value)}">${esc(o.label)}</option>`).join('')}
  </select>`;
}

function hiddenFields(unit, lang) {
  return `
  <input type="hidden" name="business_unit" value="${attr(unit)}">
  <input type="hidden" name="page_language" value="${attr(lang)}">
  <input type="hidden" name="lead_key" value="">
  <input type="hidden" name="campaign_id" value="">
  <input type="hidden" name="utm_source" value=""><input type="hidden" name="utm_medium" value=""><input type="hidden" name="utm_campaign" value=""><input type="hidden" name="utm_content" value=""><input type="hidden" name="utm_term" value="">
  <input type="hidden" name="first_utm_source" value=""><input type="hidden" name="first_utm_medium" value=""><input type="hidden" name="first_utm_campaign" value="">
  <input type="hidden" name="referrer" value="">
  <input type="hidden" name="landing_path" value="">
  <div class="hp" aria-hidden="true"><label for="${unit}-website">Website</label><input type="text" id="${unit}-website" name="website" tabindex="-1" autocomplete="off"></div>`;
}

function contact({ site, t, lang }) {
  const c = t.contact;
  const f = c.fields;
  const o = c.options;
  const endpoint = site.form.endpoint;
  const consent = (unit) => `
  <div class="field field-check">
    <input type="checkbox" id="${unit}-consent-required" name="consent_required" value="yes" required aria-required="true" aria-describedby="${unit}-consent-required-error">
    <label for="${unit}-consent-required">${esc(f.consentRequired)} <a href="${pagePath(lang, 'privacy')}" target="_blank" rel="noopener">${esc(c.privacyNotice)}</a></label>
    <p class="error" id="${unit}-consent-required-error" hidden></p>
  </div>
  <div class="field field-check">
    <input type="checkbox" id="${unit}-consent-marketing" name="consent_marketing" value="yes">
    <label for="${unit}-consent-marketing">${esc(f.consentMarketing)}</label>
  </div>`;

  const studioForm = `
<form class="lead-form" id="studio-form" method="post" action="${attr(endpoint || '#')}" novalidate data-lead-form data-unit="studio" ${endpoint ? '' : 'data-no-endpoint'}>
  ${hiddenFields('studio', lang)}
  ${field({ id: 'studio-name', label: f.name, required: true, input: `<input type="text" id="studio-name" name="name" required aria-required="true" autocomplete="name" minlength="2" maxlength="80" aria-describedby="studio-name-error">` })}
  ${field({ id: 'studio-contact', label: f.contact, hint: f.contactHint, required: true, input: `<input type="text" id="studio-contact" name="contact" required aria-required="true" autocomplete="email" maxlength="120" aria-describedby="studio-contact-hint studio-contact-error">` })}
  ${field({ id: 'studio-service', label: f.serviceInterest, required: true, input: selectInput('studio-service', 'service_interest', o.serviceInterest, f.select, true) })}
  ${field({ id: 'studio-previous', label: f.hasPrevious, required: false, input: selectInput('studio-previous', 'has_previous', o.hasPrevious, f.select, false) })}
  ${field({ id: 'studio-visit', label: f.visitDate, hint: f.visitDateHint, required: false, input: `<input type="text" id="studio-visit" name="visit_date" maxlength="80" aria-describedby="studio-visit-hint studio-visit-error">` })}
  ${field({ id: 'studio-lang', label: f.preferredLanguage, required: true, input: selectInput('studio-lang', 'preferred_language', o.preferredLanguage, f.select, true) })}
  ${field({ id: 'studio-message', label: f.message, hint: f.messageHint, required: false, input: `<textarea id="studio-message" name="message" rows="4" maxlength="1000" aria-describedby="studio-message-hint studio-message-error"></textarea>` })}
  ${consent('studio')}
  <p class="form-summary error" data-form-summary hidden role="alert"></p>
  <button class="btn btn-primary btn-lg" type="submit" data-submit-label="${attr(f.submitStudio)}" data-submitting-label="${attr(f.submitting)}">${esc(f.submitStudio)}</button>
  <p class="muted small">${esc(t.common.kstNote)} ${esc(c.responseNote)}</p>
</form>`;

  const academyForm = `
<form class="lead-form" id="academy-form" method="post" action="${attr(endpoint || '#')}" novalidate data-lead-form data-unit="academy" ${endpoint ? '' : 'data-no-endpoint'}>
  ${hiddenFields('academy', lang)}
  ${field({ id: 'academy-name', label: f.name, required: true, input: `<input type="text" id="academy-name" name="name" required aria-required="true" autocomplete="name" minlength="2" maxlength="80" aria-describedby="academy-name-error">` })}
  ${field({ id: 'academy-contact', label: f.contact, hint: f.contactHint, required: true, input: `<input type="text" id="academy-contact" name="contact" required aria-required="true" autocomplete="tel" maxlength="120" aria-describedby="academy-contact-hint academy-contact-error">` })}
  ${field({ id: 'academy-experience', label: f.experience, required: true, input: selectInput('academy-experience', 'experience_level', o.experience, f.select, true) })}
  ${field({ id: 'academy-course', label: f.courseInterest, required: true, input: selectInput('academy-course', 'course_interest', o.courseInterest, f.select, true) })}
  ${field({ id: 'academy-timing', label: f.startTiming, required: false, input: selectInput('academy-timing', 'start_timing', o.startTiming, f.select, false) })}
  ${field({ id: 'academy-lang', label: f.preferredLanguage, required: true, input: selectInput('academy-lang', 'preferred_language', o.preferredLanguage, f.select, true) })}
  ${field({ id: 'academy-message', label: f.message, hint: f.messageHint, required: false, input: `<textarea id="academy-message" name="message" rows="4" maxlength="1000" aria-describedby="academy-message-hint academy-message-error"></textarea>` })}
  ${consent('academy')}
  <p class="form-summary error" data-form-summary hidden role="alert"></p>
  <button class="btn btn-primary btn-lg" type="submit" data-submit-label="${attr(f.submitAcademy)}" data-submitting-label="${attr(f.submitting)}">${esc(f.submitAcademy)}</button>
  <p class="muted small">${esc(t.common.kstNote)} ${esc(c.responseNote)}</p>
</form>`;

  const channels = channelsList(site, t);

  return hero(t, c, { eyebrow: c.hero.eyebrow, heading: c.hero.heading, sub: c.hero.sub, unit: 'brand' })
  + `
<section class="section" aria-labelledby="forms-h">
  <div class="container">
    <h2 id="forms-h" class="sr-only">${esc(c.hero.heading)}</h2>
    ${endpoint ? '' : `<div class="notice notice-warn"><p>${esc(c.endpointMissing)}</p></div>`}
    <script>window.__LK_FORM_MESSAGES=${JSON.stringify(c.errors).replace(/</g, '\\u003c')};</script>
    <div class="tabs" data-tabs>
      <div class="tablist" role="tablist" aria-label="${attr(c.hero.heading)}">
        <button role="tab" id="tab-studio" aria-controls="studio" aria-selected="true" type="button" data-tab="studio">${esc(c.tabs.studio)}</button>
        <button role="tab" id="tab-academy" aria-controls="academy" aria-selected="false" tabindex="-1" type="button" data-tab="academy">${esc(c.tabs.academy)}</button>
      </div>
      <div class="tabpanel" role="tabpanel" id="studio" aria-labelledby="tab-studio">
        <h3 class="panel-title">${esc(c.tabs.studio)}</h3>
        ${studioForm}
      </div>
      <div class="tabpanel" role="tabpanel" id="academy" aria-labelledby="tab-academy" hidden>
        <h3 class="panel-title">${esc(c.tabs.academy)}</h3>
        ${academyForm}
      </div>
    </div>
  </div>
</section>`
  + section('other', c.otherChannels, (channels || '') + languageSupportBlock(site, t, lang), 'section-alt')
  + section('location', t.common.locationLabel, locationBlock(site, t, lang));
}

function thanks({ t, lang }) {
  const th = t.thanks;
  return `
<section class="hero hero-compact">
  <div class="container">
    <h1>${esc(th.heading)}</h1>
    <p class="lead" data-thanks-unit data-studio="${attr(th.studio)}" data-academy="${attr(th.academy)}" data-event="${attr(th.event)}"></p>
    <p class="prose">${esc(th.body)}</p>
    <h2 class="h3">${esc(th.next)}</h2>
    <div class="hero-actions">
      <a class="btn btn-secondary" href="${pagePath(lang, 'studio')}">${esc(th.links.studio)}</a>
      <a class="btn btn-secondary" href="${pagePath(lang, 'academy')}">${esc(th.links.academy)}</a>
      <a class="btn btn-secondary" href="${pagePath(lang, '')}">${esc(th.links.home)}</a>
    </div>
  </div>
</section>`;
}

function privacy({ site, t, lang }) {
  const p = t.privacy;
  const ret = site.privacy.retention;
  const pc = site.privacy.contact;
  return hero(t, p, { eyebrow: p.hero.eyebrow, heading: p.hero.heading, unit: 'brand' })
  + `
<section class="section">
  <div class="container prose-block">
    <p class="muted small">${esc(p.updatedLabel)}: ${esc(site.privacy.lastUpdated)} · ${esc(site.privacy.controller)}</p>
    ${p.sections.map((s) => `<h2>${esc(s.heading)}</h2>${list(s.items)}`).join('')}
    ${show(site, ret) && ret[lang] ? `<h2>${esc(p.retentionHeading)}</h2><p>${esc(ret[lang])}${!ret.verified ? badge(site, t) : ''}</p>` : ''}
    ${show(site, pc) && pc[lang] ? `<h2>${esc(p.contactHeading)}</h2><p>${esc(pc[lang])}${!pc.verified ? badge(site, t) : ''}</p>` : ''}
  </div>
</section>`;
}

function notFound({ t, lang }) {
  const n = t.notFound;
  return `
<section class="hero hero-compact">
  <div class="container">
    <h1>${esc(n.heading)}</h1>
    <p class="lead">${esc(n.body)}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${pagePath(lang, '')}">${esc(t.common.backHome)}</a>
      <a class="btn btn-secondary" href="${pagePath(lang, 'studio')}">${esc(t.common.nav.studio)}</a>
      <a class="btn btn-secondary" href="${pagePath(lang, 'academy')}">${esc(t.common.nav.academy)}</a>
    </div>
  </div>
</section>`;
}

// 루트 `/` — 기본 언어 홈(/ko/)으로 즉시 이동. 호스팅 레벨 301 이 우선이며, 이 페이지는 정적 폴백입니다.
// IP·브라우저 언어 기반 강제 이동은 하지 않습니다 (Google 지침). 언어 전환은 각 페이지 헤더에서 제공.
function root({ site, langs }) {
  const target = pagePath(site.defaultLang, '');
  return `<!doctype html>
<html lang="${attr(site.defaultLang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${attr(target)}">
<link rel="canonical" href="${attr(site.baseUrl + target)}">
<title>${esc(site.brand)}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>body{margin:0;font-family:-apple-system,"Segoe UI","Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif;background:#faf9f6;color:#22313a;text-align:center;padding:64px 16px}a{color:#1e4d60;font-weight:600;margin:0 10px}</style>
</head>
<body>
<p><a href="${attr(target)}">${esc(site.brand)}</a></p>
<p>${langs.map((l) => `<a href="${pagePath(l.code, '')}" lang="${attr(l.code)}" hreflang="${attr(l.code)}">${esc(l.name)}</a>`).join('')}</p>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;
}

module.exports = { home, studio, academy, about, contact, thanks, privacy, notFound, root };
