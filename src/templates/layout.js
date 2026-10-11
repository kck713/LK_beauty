'use strict';
const { esc, attr, fill, pagePath } = require('./helpers');

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
  ];
  const ogImage = meta.ogImage ? site.baseUrl + '/' + meta.ogImage : '';
  const gtm = site.analytics.gtmId;

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
<link rel="stylesheet" href="/assets/main.css">
<meta name="theme-color" content="#f8f5f0">
<script>window.dataLayer=window.dataLayer||[];window.__LK={pageLanguage:${JSON.stringify(lang)},pageType:${JSON.stringify(page || 'home')},businessUnit:${JSON.stringify(ctx.businessUnit || 'brand')},formEndpoint:${JSON.stringify(site.form.endpoint)},thanksPath:${JSON.stringify(pagePath(lang, 'contact/thanks'))}};</script>
${gtm ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtm)});</script>` : ''}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body class="${attr(bodyClass)}${mobileCta ? ' has-mobile-cta' : ''}">
${gtm ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${attr(gtm)}" height="0" width="0" style="display:none;visibility:hidden" title="gtm"></iframe></noscript>` : ''}
<a class="skip-link" href="#main">${esc(t.common.skipToContent)}</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${pagePath(lang, '')}" aria-label="${attr(t.common.brand)} — ${attr(t.common.nav.home)}">
      <span class="brand-mark" aria-hidden="true">LK</span>
      <span class="brand-text">${esc(t.common.brand)}</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
      <span class="nav-toggle-label">${esc(t.common.menu)}</span>
      <span class="nav-toggle-bars" aria-hidden="true"></span>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="${attr(t.common.menu)}">
      <ul class="nav-list">
        ${nav.map(([p, label]) => `<li><a href="${pagePath(lang, p)}"${(p === page || (p === '' && page === 'home')) ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`).join('')}
      </ul>
      <div class="lang-switch" aria-label="${attr(t.common.languageLabel)}">
        ${alternates.map((a) => a.lang === lang
          ? `<span class="lang-current" aria-current="true" lang="${attr(a.lang)}"><span class="sr-only">${esc(t.common.currentLanguage)}: </span>${esc(a.name)}</span>`
          : `<a href="${attr(a.href)}" hreflang="${attr(a.lang)}" lang="${attr(a.lang)}" rel="alternate">${esc(a.name)}</a>`).join('<span class="lang-sep" aria-hidden="true">·</span>')}
      </div>
    </nav>
  </div>
</header>
<main id="main" tabindex="-1">
${content}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <strong>${esc(t.common.brand)}</strong>
      <span>${esc(t.common.unitLabel)}</span>
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
${mobileCta ? `<div class="mobile-cta" role="region" aria-label="${attr(mobileCta.label)}"><a class="btn btn-primary" href="${attr(mobileCta.href)}" data-cta="mobile-sticky" data-unit="${attr(mobileCta.unit)}">${esc(mobileCta.label)}</a></div>` : ''}
<script src="/assets/main.js" defer></script>
</body>
</html>`;
}

module.exports = { layout };
