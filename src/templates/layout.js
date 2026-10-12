'use strict';
const { esc, attr, fill, pagePath } = require('./helpers');

// 언어별 웹폰트: 세리프 디스플레이(Playfair) + 본문(Montserrat, 라틴) + 언어별 세리프(CJK)
function fontsHref(lang) {
  // 워드마크·영문 디스플레이: Playfair Display 이탤릭(하이컨트라스트 세리프). 본문·한글/일문 제목: 산세리프.
  const fam = ['family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700', 'family=Montserrat:wght@400;500;600;700'];
  if (lang === 'ko') fam.push('family=Noto+Sans+KR:wght@400;500;700');
  if (lang === 'ja') fam.push('family=Noto+Sans+JP:wght@400;500;700');
  return `https://fonts.googleapis.com/css2?${fam.join('&')}&display=swap`;
}

/**
 * 공통 레이아웃.
 * ctx: { site, t, lang, page, canonicalPath, alternates:[{lang,href}], xDefault, ogImage, bodyClass, mobileCta:{href,label,unit}|null, noindex }
 */
function layout(ctx, content) {
  const { site, t, lang, page, canonicalPath, alternates, xDefault, meta, bodyClass = '', mobileCta = null, noindex = false, jsonLd = null } = ctx;
  const year = new Date().getFullYear();
  const canonical = site.baseUrl + canonicalPath;
  const nav = [
    ['', t.common.nav.home],
    ['studio', t.common.nav.studio],
    ['academy', t.common.nav.academy],
    ['about', t.common.nav.about],
    ['contact', t.common.nav.contact],
    ...(ctx.showNews ? [['news', t.common.nav.news]] : []),
  ];
  const ogImage = meta.ogImage ? site.baseUrl + '/' + meta.ogImage : '';
  const gtm = site.analytics.gtmId;
  const activeUnit = ctx.businessUnit === 'studio' || ctx.businessUnit === 'academy' ? ctx.businessUnit : 'brand';
  const contactPath = pagePath(lang, 'contact') + (activeUnit === 'brand' ? '' : '#' + activeUnit);
  const contactLabel = activeUnit === 'studio' ? t.common.ctaStudio : activeUnit === 'academy' ? t.common.ctaAcademy : t.common.ctaContact;

  return `<!doctype html>
<html lang="${attr(t.htmlLang)}" dir="${attr(t.dir)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${attr(meta.description)}">
${noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<link rel="canonical" href="${attr(canonical)}">
${alternates.map((a) => `<link rel="alternate" hreflang="${attr(a.lang)}" href="${attr(site.baseUrl + a.href)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${attr(site.baseUrl + xDefault)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${attr(site.brand)}">
<meta property="og:title" content="${attr(meta.title)}">
<meta property="og:description" content="${attr(meta.description)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:locale" content="${attr({ ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' }[lang] || lang)}">
${ogImage ? `<meta property="og:image" content="${attr(ogImage)}">` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${attr(fontsHref(lang))}">
<link rel="stylesheet" href="/assets/main.css">
<meta name="theme-color" content="#1c5cff">
<script>window.dataLayer=window.dataLayer||[];window.__LK={pageLanguage:${JSON.stringify(lang)},pageType:${JSON.stringify(page || 'home')},businessUnit:${JSON.stringify(ctx.businessUnit || 'brand')},formEndpoint:${JSON.stringify(site.form.endpoint)},thanksPath:${JSON.stringify(pagePath(lang, 'contact/thanks'))}};</script>
${gtm ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtm)});</script>` : ''}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body class="${attr(bodyClass)}${mobileCta ? ' has-mobile-cta' : ''}">
${gtm ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${attr(gtm)}" height="0" width="0" style="display:none;visibility:hidden" title="gtm"></iframe></noscript>` : ''}
<a class="skip-link" href="#main">${esc(t.common.skipToContent)}</a>
<header class="site-header">
  <div class="container header-inner">
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
      <span class="nav-toggle-label">${esc(t.common.menu)}</span>
      <span class="nav-toggle-bars" aria-hidden="true"></span>
    </button>
    <a class="brand" href="${pagePath(lang, '')}" aria-label="${attr(t.common.brand)} — ${attr(t.common.nav.home)}">
      <span class="brand-text">LK Beauty<span class="brand-axis">Axis</span></span>
      <span class="brand-sub">${esc(t.common.unitLabel)}</span>
    </a>
    <a class="header-contact" href="${contactPath}" aria-label="${attr(contactLabel)}" data-cta="header-icon" data-unit="${attr(ctx.businessUnit || 'brand')}">
      <span class="header-contact-label">${esc(contactLabel)}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 5h16v11H8l-4 4V5z" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke-linecap="round"/></svg>
    </a>
    <nav id="site-nav" class="site-nav" aria-label="${attr(t.common.menu)}">
      <ul class="nav-list">
        ${nav.map(([p, label]) => `<li><a href="${pagePath(lang, p)}"${(p === page || (p === '' && page === 'home')) ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`).join('')}
      </ul>
    </nav>
      <div class="lang-switch" aria-label="${attr(t.common.languageLabel)}">
        ${alternates.map((a) => a.lang === lang
          ? `<span class="lang-current" aria-current="true" lang="${attr(a.lang)}"><span class="sr-only">${esc(t.common.currentLanguage)}: </span>${esc(a.name)}</span>`
          : `<a href="${attr(a.href)}" hreflang="${attr(a.lang)}" lang="${attr(a.lang)}" rel="alternate">${esc(a.name)}</a>`).join('<span class="lang-sep" aria-hidden="true">·</span>')}
      </div>
  </div>
</header>
<main id="main" tabindex="-1">
${content}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <strong class="brand-text">LK Beauty<span class="brand-axis">Axis</span></strong>
      <span>${esc(t.common.unitLabel)}</span>
      <span class="footer-tagline">${esc(t.common.tagline)}</span>
    </div>
    <ul class="footer-links">
      ${nav.map(([p, label]) => `<li><a href="${pagePath(lang, p)}">${esc(label)}</a></li>`).join('')}
      <li><a href="${pagePath(lang, 'privacy')}">${esc(t.common.nav.privacy)}</a></li>
    </ul>
    <ul class="footer-channels">
      ${site.channels.instagram.verified ? `<li><a href="${attr(site.channels.instagram.url)}" rel="me noopener" target="_blank" data-contact="instagram">${esc(t.common.instagram)} ${esc(site.channels.instagram.label)}</a></li>` : ''}
    </ul>
    <p class="footer-note">${esc(fill(t.common.footerNote, { year }))}</p>
    <p class="footer-note">${esc(t.common.kstNote)}</p>
  </div>
</footer>
${page !== '404' ? `<nav class="quick-menu" aria-label="${attr(t.common.quickMenu.label)}">
  <a class="quick-item quick-contact" href="${contactPath}" data-cta="quick-contact" data-unit="${attr(ctx.businessUnit || 'brand')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 5h16v11H8l-4 4V5z" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke-linecap="round"/></svg><span>${esc(contactLabel)}</span></a>
  ${site.channels.instagram.verified ? `<a class="quick-item" href="${attr(site.channels.instagram.url)}" target="_blank" rel="me noopener" data-contact="instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg><span>${esc(t.common.instagram)}</span></a>` : ''}
  ${site.channels.kakao.verified && site.channels.kakao.url ? `<a class="quick-item" href="${attr(site.channels.kakao.url)}" target="_blank" rel="noopener" data-contact="kakao"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4C7 4 3.5 7 3.5 10.6c0 2.3 1.5 4.3 3.8 5.5L6.5 20l4-2.6c.5.1 1 .1 1.5.1 5 0 8.5-3 8.5-6.9S17 4 12 4z" stroke-linejoin="round"/></svg><span>${esc(t.common.kakao)}</span></a>` : ''}
  <a class="quick-item quick-top" href="#main" data-quick-top><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 19V6M6 12l6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${esc(t.common.quickMenu.top)}</span></a>
</nav>` : ''}
${ctx.modalHtml || ''}
${mobileCta ? `<div class="mobile-cta" role="region" aria-label="${attr(mobileCta.label)}"><a class="btn btn-primary" href="${attr(mobileCta.href)}" data-cta="mobile-sticky" data-unit="${attr(mobileCta.unit)}">${esc(mobileCta.label)}</a></div>` : ''}
<script src="/assets/main.js" defer></script>
</body>
</html>`;
}

module.exports = { layout };
