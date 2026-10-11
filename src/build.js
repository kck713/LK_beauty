#!/usr/bin/env node
// 정적 사이트 빌드 — 의존성 없음. `node src/build.js` → dist/
'use strict';
const fs = require('fs');
const path = require('path');

const site = require('../content/site');
const studioData = require('../content/studio');
const academyData = require('../content/academy');
const assets = require('../content/assets');
const { layout } = require('./templates/layout');
const pages = require('./templates/pages');
const { pagePath } = require('./templates/helpers');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

const langs = site.languages.map((code) => require(`../content/i18n/${code}`));

// ---------- i18n 키 구조 검증 ----------
function keysOf(o, p = '') {
  return Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v)) ? keysOf(v, `${p}${k}.`) : [`${p}${k}`]);
}
function validateI18n() {
  const base = new Set(keysOf(langs[0]));
  let bad = false;
  for (const l of langs.slice(1)) {
    const s = new Set(keysOf(l));
    const missing = [...base].filter((k) => !s.has(k));
    const extra = [...s].filter((k) => !base.has(k));
    if (missing.length || extra.length) {
      bad = true;
      console.error(`[i18n] ${l.code}: missing=${JSON.stringify(missing)} extra=${JSON.stringify(extra)}`);
    }
  }
  // 빈 문자열 검사 (공개 문구에 빈값 금지)
  for (const l of langs) {
    const walk = (o, p) => Object.entries(o).forEach(([k, v]) => {
      if (v && typeof v === 'object') walk(v, `${p}${k}.`);
      else if (typeof v === 'string' && v.trim() === '') { bad = true; console.error(`[i18n] ${l.code}: empty string at ${p}${k}`); }
    });
    walk(l, '');
  }
  if (bad) { console.error('i18n validation failed'); process.exit(1); }
}

// ---------- 유틸 ----------
function write(rel, html) {
  const out = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name); const d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
function assetReady(rel) {
  const a = assets[rel];
  return a && a.status === 'ready' && fs.existsSync(path.join(PUBLIC, rel));
}

// ---------- 페이지 정의 ----------
// group: hreflang 대응 그룹. 같은 서비스의 언어판끼리만 연결 (스튜디오↔스튜디오, 아카데미↔아카데미).
const PAGE_DEFS = [
  { key: 'home', slug: '', render: pages.home, unit: 'brand', og: 'images/og/default.png', mobileCta: null },
  { key: 'studio', slug: 'studio', render: pages.studio, unit: 'studio', og: 'images/og/studio.png', mobileCta: 'studio' },
  { key: 'academy', slug: 'academy', render: pages.academy, unit: 'academy', og: 'images/og/academy.png', mobileCta: 'academy' },
  { key: 'about', slug: 'about', render: pages.about, unit: 'brand', og: 'images/og/default.png', mobileCta: null },
  { key: 'contact', slug: 'contact', render: pages.contact, unit: 'brand', og: 'images/og/default.png', mobileCta: null },
  { key: 'privacy', slug: 'privacy', render: pages.privacy, unit: 'brand', og: 'images/og/default.png', mobileCta: null },
  { key: 'thanks', slug: 'contact/thanks', render: pages.thanks, unit: 'brand', og: 'images/og/default.png', mobileCta: null, noindex: true },
];

function build() {
  validateI18n();
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  copyDir(PUBLIC, DIST);
  fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'src/styles/main.css'), path.join(DIST, 'assets/main.css'));
  fs.copyFileSync(path.join(ROOT, 'src/scripts/main.js'), path.join(DIST, 'assets/main.js'));
  fs.copyFileSync(path.join(ROOT, 'src/scripts/root.js'), path.join(DIST, 'assets/root.js'));

  const sitemapUrls = [];
  const addSitemap = (loc, alternates) => sitemapUrls.push({ loc, alternates });

  // 루트 언어 선택
  write('index.html', pages.root({ site, langs }));
  addSitemap('/', [...langs.map((l) => ({ lang: l.code, href: pagePath(l.code, '') })), { lang: 'x-default', href: '/' }]);

  for (const def of PAGE_DEFS) {
    const alternates = langs.map((l) => ({ lang: l.code, name: l.name, href: pagePath(l.code, def.slug) }));
    // x-default: 해당 페이지 그룹의 기본 언어(한국어)판. 홈은 루트 언어 선택 페이지.
    const xDefault = def.key === 'home' ? '/' : pagePath(site.defaultLang, def.slug);

    for (const t of langs) {
      const lang = t.code;
      const meta = {
        title: t[def.key].title,
        description: t[def.key].description || '',
        ogImage: assetReady(def.og) ? def.og : (assetReady('images/og/default.png') ? 'images/og/default.png' : ''),
      };
      const mobileCta = def.mobileCta ? {
        href: pagePath(lang, 'contact') + '#' + def.mobileCta,
        label: def.mobileCta === 'studio' ? t.common.mobileCtaStudio : t.common.mobileCtaAcademy,
        unit: def.mobileCta,
      } : null;

      const jsonLd = def.key === 'home' ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: site.brand,
        url: site.baseUrl + pagePath(lang, ''),
        sameAs: [site.channels.instagram.url],
        ...(site.address.verified ? { address: { '@type': 'PostalAddress', streetAddress: site.address.full[lang], addressLocality: 'Seoul', addressCountry: 'KR' } } : {}),
      } : null;

      const html = layout({
        site, t, lang, page: def.key, businessUnit: def.unit,
        canonicalPath: pagePath(lang, def.slug), alternates, xDefault, meta,
        bodyClass: `page-${def.key} lang-${lang}`, mobileCta, noindex: !!def.noindex, jsonLd,
      }, def.render({ site, t, lang, studio: studioData, academy: academyData, ready: assetReady }));

      write(path.join(lang, def.slug, 'index.html'), html);
      if (!def.noindex) {
        addSitemap(pagePath(lang, def.slug), [...alternates.map((a) => ({ lang: a.lang, href: a.href })), { lang: 'x-default', href: xDefault }]);
      }
    }
  }

  // 404 — 서버가 어떤 경로에서든 서빙. 언어별 링크 포함 (한국어 기본 + 언어 전환).
  for (const t of langs) {
    const alternates = langs.map((l) => ({ lang: l.code, name: l.name, href: pagePath(l.code, '') }));
    const html = layout({
      site, t, lang: t.code, page: '404', businessUnit: 'brand',
      canonicalPath: pagePath(t.code, ''), alternates, xDefault: '/', meta: { title: t.notFound.title, description: t.notFound.body, ogImage: '' },
      bodyClass: `page-404 lang-${t.code}`, noindex: true,
    }, pages.notFound({ t, lang: t.code }));
    write(path.join(t.code, '404.html'), html);
    if (t.code === site.defaultLang) write('404.html', html);
  }

  // sitemap.xml (hreflang alternates 포함)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.map((u) => `  <url>
    <loc>${site.baseUrl}${u.loc}</loc>
${u.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${site.baseUrl}${a.href}"/>`).join('\n')}
  </url>`).join('\n')}
</urlset>
`;
  write('sitemap.xml', sitemap);
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /*/contact/thanks/\nSitemap: ${site.baseUrl}/sitemap.xml\n`);

  // favicon (로고 확정 전 임시)
  if (!fs.existsSync(path.join(DIST, 'favicon.svg'))) {
    write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#2b2a28"/><text x="32" y="41" font-family="Georgia, serif" font-size="26" text-anchor="middle" fill="#f8f5f0" letter-spacing="1">LK</text></svg>`);
  }

  // 빌드 리포트
  const report = {
    builtAt: new Date().toISOString(),
    preview: site.preview,
    baseUrl: site.baseUrl,
    formEndpoint: site.form.endpoint ? 'set' : 'MISSING',
    gtm: site.analytics.gtmId ? 'set' : 'not set',
    pages: sitemapUrls.length,
    missingAssets: Object.entries(assets).filter(([k]) => !assetReady(k)).map(([k, v]) => `${k} (${v.status})`),
    unverified: [
      ...(site.address.verified ? [] : ['site.address']),
      ...(site.hours.verified ? [] : ['site.hours']),
      ...(site.supportLanguages.verified ? [] : ['site.supportLanguages']),
      ...Object.entries(site.channels).filter(([, c]) => !c.verified).map(([k]) => `site.channels.${k}`),
      ...studioData.services.filter((s) => !s.verified).map((s) => `studio.services.${s.id}`),
      ...studioData.cases.filter((s) => !s.verified).map((s) => `studio.cases.${s.id}`),
      ...academyData.courses.filter((s) => !s.verified).map((s) => `academy.courses.${s.id}`),
      ...academyData.instructors.filter((s) => !s.verified).map((s) => `academy.instructors.${s.id}`),
    ],
  };
  fs.writeFileSync(path.join(DIST, 'build-report.json'), JSON.stringify(report, null, 2));
  console.log(`Built ${sitemapUrls.length} indexable pages → dist/ ${site.preview ? '(PREVIEW: unverified items visible)' : ''}`);
  if (!site.form.endpoint) console.warn('WARN: FORM_ENDPOINT not set — forms render in "접수 준비 중" state.');
  if (site.baseUrl.includes('.example')) console.warn('WARN: SITE_URL not set — canonical/hreflang use placeholder domain.');
}

build();
