#!/usr/bin/env node
// 정적 사이트 빌드 — 의존성 없음. `node src/build.js` → dist/
'use strict';
const fs = require('fs');
const path = require('path');

const site = require('../content/site');
const studioData = require('../content/studio');
const academyData = require('../content/academy');
const assets = require('../content/assets');
const posts = require('../content/posts');
const testimonials = require('../content/testimonials');
const extras = require('./templates/extras');
const { layout } = require('./templates/layout');
const pages = require('./templates/pages');
const { pagePath } = require('./templates/helpers');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

const langs = site.languages.map((code) => require(`../content/i18n/${code}`));

// 개발·QA 전용 샘플 데이터 (공개 배포 금지)
const FIXTURES = process.env.FIXTURES === '1';
if (FIXTURES) {
  require('../scripts/fixtures')({ posts, testimonials, studio: studioData, academy: academyData });
  console.warn('WARN: FIXTURES=1 — sample content merged. NEVER deploy this build.');
}

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

// ---------- 콘텐츠(JSON) 유효성 검사 — CMS 편집 실수를 빌드 단계에서 차단 ----------
function validateContent() {
  const errs = [];
  const L = site.languages;
  const isId = (v) => typeof v === 'string' && /^[a-z0-9-]+$/.test(v);
  const i18nObj = (o) => o && typeof o === 'object';
  const uniq = (arr, what) => { const seen = new Set(); for (const x of arr) { if (seen.has(x.id)) errs.push(`${what}: duplicate id "${x.id}"`); seen.add(x.id); } };

  for (const sv of studioData.services) {
    if (!isId(sv.id)) errs.push(`studio.services: invalid id "${sv.id}"`);
    if (!i18nObj(sv.name) || L.some((l) => !sv.name[l])) errs.push(`studio.services.${sv.id}: name must have ko/en/ja`);
    if (sv.priceKRW != null && sv.priceKRW !== '' && !(Number(sv.priceKRW) > 0)) errs.push(`studio.services.${sv.id}: priceKRW must be a positive number`);
    if (sv.verified && sv.slug && L.some((l) => sv.slug[l] && !/^[a-z0-9-]+$/.test(sv.slug[l]))) errs.push(`studio.services.${sv.id}: slug must be lowercase a-z0-9-`);
  }
  uniq(studioData.services, 'studio.services');
  for (const c of studioData.cases) {
    if (!isId(c.id)) errs.push(`studio.cases: invalid id "${c.id}"`);
    if (c.verified && !c.consent) errs.push(`studio.cases.${c.id}: verified case requires consent`);
    if (c.verified && !assetReady(c.image)) errs.push(`studio.cases.${c.id}: image missing (${c.image})`);
    if (c.verified && !['immediate', 'healed', 'after-retouch'].includes(c.stage)) errs.push(`studio.cases.${c.id}: invalid stage`);
  }
  for (const c of academyData.courses) {
    if (!isId(c.id)) errs.push(`academy.courses: invalid id "${c.id}"`);
    if (c.verified && L.some((l) => !c.name[l])) errs.push(`academy.courses.${c.id}: verified course needs name in ko/en/ja`);
    if (c.priceKRW != null && c.priceKRW !== '' && !(Number(c.priceKRW) > 0)) errs.push(`academy.courses.${c.id}: priceKRW must be a positive number`);
  }
  uniq(academyData.courses, 'academy.courses');
  for (const g of academyData.growthCases) if (g.verified && !g.consent) errs.push(`academy.growthCases.${g.id}: verified case requires consent`);
  for (const p of posts) {
    if (!isId(p.id)) errs.push(`posts: invalid id "${p.id}"`);
    if (!['news', 'event', 'promotion'].includes(p.type)) errs.push(`posts.${p.id}: invalid type "${p.type}"`);
    if (p.verified && !L.some((l) => p.slug && p.slug[l] && p.title && p.title[l])) errs.push(`posts.${p.id}: verified post needs slug+title in at least one language`);
    for (const l of L) if (p.slug && p.slug[l] && !/^[a-z0-9-]+$/.test(p.slug[l])) errs.push(`posts.${p.id}: slug.${l} must be lowercase a-z0-9-`);
    if (p.type === 'event' && p.verified && p.event && p.event.registrationOpen && !p.event.startsAt) errs.push(`posts.${p.id}: open registration requires startsAt`);
  }
  uniq(posts, 'posts');
  const modals = posts.filter((p) => p.modal && p.modal.enabled && (p.verified || site.preview));
  if (modals.length > 1) errs.push(`posts: more than one modal enabled (${modals.map((p) => p.id).join(', ')})`);
  for (const t of testimonials) {
    if (!isId(t.id)) errs.push(`testimonials: invalid id "${t.id}"`);
    if (!['studio', 'academy'].includes(t.unit)) errs.push(`testimonials.${t.id}: unit must be studio|academy`);
    if (t.verified && !t.consent) errs.push(`testimonials.${t.id}: verified testimonial requires consent`);
  }
  uniq(testimonials, 'testimonials');
  if (errs.length) { errs.forEach((e) => console.error('[content] ' + e)); console.error('content validation failed'); process.exit(1); }
}

// ---------- 유틸 ----------
// RELATIVE=1: 절대 경로(/ko/studio/)를 상대 경로(../studio/index.html)로 변환 — 하위 경로·미리보기 호스팅(아티팩트 등)용. 공개 배포에서는 사용하지 않음.
const RELATIVE = process.env.RELATIVE === '1';
function relativize(html, rel) {
  const depth = rel.split('/').length - 1; // 'ko/studio/index.html' → 2
  const prefix = depth ? '../'.repeat(depth) : './';
  const conv = (p) => prefix + (p.endsWith('/') ? p + 'index.html' : p);
  return html
    .replace(/\b(href|src|action)="\/(?!\/)([^"#?]*)([#?][^"]*)?"/g, (m, a, p, rest) => `${a}="${conv(p)}${rest || ''}"`)
    .replace(/thanksPath:"\/([^"]*)"/g, (m, p) => `thanksPath:"${conv(p)}"`);
}
function write(rel, html) {
  const out = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, RELATIVE && rel.endsWith('.html') ? relativize(html, rel) : html);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name); const d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
// 이미지 자산 준비 여부: public/ 에 실제 파일이 있으면 사용 (CMS 업로드 즉시 반영). content/assets.js 는 체크리스트 용도.
function assetReady(rel) {
  return !!rel && fs.existsSync(path.join(PUBLIC, rel));
}

// ---------- 페이지 정의 ----------
// group: hreflang 대응 그룹. 같은 서비스의 언어판끼리만 연결 (스튜디오↔스튜디오, 아카데미↔아카데미).
const PAGE_DEFS = [
  { key: 'home', slug: '', render: pages.home, unit: 'brand', og: 'images/og/default.jpg', mobileCta: null },
  { key: 'studio', slug: 'studio', render: pages.studio, unit: 'studio', og: 'images/og/studio.jpg', mobileCta: 'studio' },
  { key: 'academy', slug: 'academy', render: pages.academy, unit: 'academy', og: 'images/og/academy.jpg', mobileCta: 'academy' },
  { key: 'about', slug: 'about', render: pages.about, unit: 'brand', og: 'images/og/default.jpg', mobileCta: null },
  { key: 'contact', slug: 'contact', render: pages.contact, unit: 'brand', og: 'images/og/default.jpg', mobileCta: null },
  { key: 'privacy', slug: 'privacy', render: pages.privacy, unit: 'brand', og: 'images/og/default.jpg', mobileCta: null },
  { key: 'thanks', slug: 'contact/thanks', render: pages.thanks, unit: 'brand', og: 'images/og/default.jpg', mobileCta: null, noindex: true },
];

function build() {
  validateI18n();
  validateContent();
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

  const anyNews = langs.some((t) => posts.some((p) => extras.postPublished(site, p, t.code)));
  const modalPost = extras.activeModalPost(site, posts);

  // 공통 페이지 작성기
  const fixtureMeta = FIXTURES ? '<meta name="lk-fixtures" content="1">' : '';
  function emit({ t, slug, alternates, xDefault, meta, pageKey, unit, mobileCta, noindex, jsonLd, bodyClass, content, withModal = true }) {
    const lang = t.code;
    const html = layout({
      site, t, lang, page: pageKey, businessUnit: unit,
      canonicalPath: pagePath(lang, slug), alternates, xDefault, meta,
      bodyClass: bodyClass || `page-${pageKey} lang-${lang}`, mobileCta, noindex: !!noindex, jsonLd,
      showNews: anyNews,
      modalHtml: withModal && modalPost ? extras.modal({ site, t, lang, p: modalPost, ready: assetReady }) : '',
    }, content);
    write(path.join(lang, slug, 'index.html'), fixtureMeta ? html.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + fixtureMeta) : html);
    if (!noindex) addSitemap(pagePath(lang, slug), [...alternates.map((a) => ({ lang: a.lang, href: a.href })), { lang: 'x-default', href: xDefault }]);
  }
  const altsFor = (slugByLang) => langs.filter((l) => slugByLang[l.code] != null).map((l) => ({ lang: l.code, name: l.name, href: pagePath(l.code, slugByLang[l.code]) }));
  const ogFor = (rel) => (assetReady(rel) ? rel : (assetReady('images/og/default.jpg') ? 'images/og/default.jpg' : ''));

  for (const def of PAGE_DEFS) {
    const slugByLang = Object.fromEntries(langs.map((l) => [l.code, def.slug]));
    const alternates = altsFor(slugByLang);
    const xDefault = def.key === 'home' ? '/' : pagePath(site.defaultLang, def.slug);
    for (const t of langs) {
      const lang = t.code;
      const meta = { title: t[def.key].title, description: t[def.key].description || '', ogImage: ogFor(def.og) };
      const mobileCta = def.mobileCta ? { href: pagePath(lang, 'contact') + '#' + def.mobileCta, label: def.mobileCta === 'studio' ? t.common.mobileCtaStudio : t.common.mobileCtaAcademy, unit: def.mobileCta } : null;
      const jsonLd = def.key === 'home' ? {
        '@context': 'https://schema.org', '@type': 'Organization', name: site.brand, url: site.baseUrl + pagePath(lang, ''), sameAs: [site.channels.instagram.url],
        ...(site.address.verified ? { address: { '@type': 'PostalAddress', streetAddress: site.address.full[lang], addressLocality: 'Seoul', addressCountry: 'KR' } } : {}),
      } : null;
      emit({
        t, slug: def.slug, alternates, xDefault, meta, pageKey: def.key, unit: def.unit, mobileCta, noindex: def.noindex, jsonLd,
        content: def.render({ site, t, lang, studio: studioData, academy: academyData, ready: assetReady, testimonials, posts }),
        withModal: !['contact', 'thanks', 'privacy'].includes(def.key),
      });
    }
  }

  // 시술 상세 (/{lang}/studio/{slug}/) — 세 언어 모두 준비된 항목만
  for (const sv of studioData.services.filter((x) => extras.detailReady(site, x, site.languages))) {
    const slugByLang = Object.fromEntries(langs.map((l) => [l.code, 'studio/' + sv.slug[l.code]]));
    const alternates = altsFor(slugByLang);
    for (const t of langs) {
      const d = sv.detail[t.code];
      emit({ t, slug: slugByLang[t.code], alternates, xDefault: pagePath(site.defaultLang, slugByLang[site.defaultLang]), pageKey: 'studio-detail', unit: 'studio',
        meta: { title: `${sv.name[t.code]} | ${t.studio.title}`, description: d.intro, ogImage: ogFor('images/og/studio.jpg') },
        mobileCta: { href: pagePath(t.code, 'contact') + '#studio', label: t.common.mobileCtaStudio, unit: 'studio' },
        content: extras.serviceDetail({ site, t, lang: t.code, sv }) });
    }
  }
  // 과정 상세 (/{lang}/academy/{slug}/)
  for (const c of academyData.courses.filter((x) => extras.detailReady(site, x, site.languages))) {
    const slugByLang = Object.fromEntries(langs.map((l) => [l.code, 'academy/' + c.slug[l.code]]));
    const alternates = altsFor(slugByLang);
    for (const t of langs) {
      const d = c.detail[t.code];
      emit({ t, slug: slugByLang[t.code], alternates, xDefault: pagePath(site.defaultLang, slugByLang[site.defaultLang]), pageKey: 'academy-detail', unit: 'academy',
        meta: { title: `${c.name[t.code]} | ${t.academy.title}`, description: d.intro, ogImage: ogFor('images/og/academy.jpg') },
        mobileCta: { href: pagePath(t.code, 'contact') + '#academy', label: t.common.mobileCtaAcademy, unit: 'academy' },
        content: extras.courseDetail({ site, t, lang: t.code, c }) });
    }
  }
  // 소식 목록 + 게시물 (/{lang}/news/, /{lang}/news/{slug}/)
  if (anyNews) {
    const slugByLang = Object.fromEntries(langs.map((l) => [l.code, 'news']));
    const alternates = altsFor(slugByLang);
    for (const t of langs) {
      const has = posts.some((p) => extras.postPublished(site, p, t.code));
      emit({ t, slug: 'news', alternates, xDefault: pagePath(site.defaultLang, 'news'), pageKey: 'news', unit: 'brand', noindex: !has,
        meta: { title: t.news.title, description: t.news.description, ogImage: ogFor('images/og/default.jpg') },
        content: extras.newsIndex({ site, t, lang: t.code, posts, ready: assetReady }) });
    }
    for (const p of posts) {
      const pubLangs = langs.filter((l) => extras.postPublished(site, p, l.code));
      if (!pubLangs.length) continue;
      const slugByLang = Object.fromEntries(pubLangs.map((l) => [l.code, 'news/' + p.slug[l.code]]));
      const alternates = altsFor(slugByLang);
      const xd = slugByLang[site.defaultLang] || slugByLang[pubLangs[0].code];
      for (const t of pubLangs) {
        emit({ t, slug: slugByLang[t.code], alternates, xDefault: pagePath(xd === slugByLang[site.defaultLang] ? site.defaultLang : pubLangs[0].code, xd), pageKey: 'post', unit: p.event && p.event.businessUnit ? p.event.businessUnit : 'brand',
          meta: { title: `${p.title[t.code]} | ${t.common.brand}`, description: p.summary[t.code] || p.title[t.code], ogImage: assetReady(p.image) ? p.image : ogFor('images/og/default.jpg') },
          content: extras.postPage({ site, t, lang: t.code, p, ready: assetReady }), withModal: false });
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
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /*/contact/thanks/\nSitemap: ${site.baseUrl}/sitemap.xml\n`);

  // favicon (로고 확정 전 임시)
  if (!fs.existsSync(path.join(DIST, 'favicon.svg'))) {
    write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#2b2a28"/><text x="32" y="41" font-family="Georgia, serif" font-size="26" text-anchor="middle" fill="#f8f5f0" letter-spacing="1">LK</text></svg>`);
  }

  // 빌드 리포트
  const report = {
    builtAt: new Date().toISOString(),
    preview: site.preview,
    fixtures: FIXTURES,
    baseUrl: site.baseUrl,
    formEndpoint: site.form.endpoint ? 'set' : 'MISSING',
    gtm: site.analytics.gtmId ? 'set' : 'not set',
    pages: sitemapUrls.length,
    missingAssets: Object.keys(assets).filter((k) => !assetReady(k)),
    unverified: [
      ...(site.address.verified ? [] : ['site.address']),
      ...(site.hours.verified ? [] : ['site.hours']),
      ...(site.supportLanguages.verified ? [] : ['site.supportLanguages']),
      ...Object.entries(site.channels).filter(([, c]) => !c.verified).map(([k]) => `site.channels.${k}`),
      ...studioData.services.filter((s) => !s.verified).map((s) => `studio.services.${s.id}`),
      ...studioData.cases.filter((s) => !s.verified).map((s) => `studio.cases.${s.id}`),
      ...academyData.courses.filter((s) => !s.verified).map((s) => `academy.courses.${s.id}`),
      ...academyData.instructors.filter((s) => !s.verified).map((s) => `academy.instructors.${s.id}`),
      ...posts.filter((s) => !s.verified).map((s) => `posts.${s.id}`),
      ...testimonials.filter((s) => !s.verified || !s.consent).map((s) => `testimonials.${s.id}`),
    ],
    modal: modalPost ? modalPost.id : null,
  };
  fs.writeFileSync(path.join(DIST, 'build-report.json'), JSON.stringify(report, null, 2));
  console.log(`Built ${sitemapUrls.length} indexable pages → dist/ ${site.preview ? '(PREVIEW: unverified items visible)' : ''}`);
  if (!site.form.endpoint) console.warn('WARN: FORM_ENDPOINT not set — forms render in "접수 준비 중" state.');
  if (site.baseUrl.includes('.example')) console.warn('WARN: SITE_URL not set — canonical/hreflang use placeholder domain.');
}

build();
