'use strict';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const attr = (s) => esc(s);

// 제목용 강조: *텍스트* → <em class="hl"> (브랜드 블루 강조)
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em class="hl">$1</em>');

// 간단한 템플릿 치환: {year} 등
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

// 언어별 경로. page: '' | 'studio' | 'academy' | 'about' | 'contact' | 'privacy' | 'contact/thanks'
const pagePath = (lang, page) => `/${lang}/${page ? page.replace(/\/?$/, '/') : ''}`;

// 미확정 항목 표시 여부
const show = (site, item) => !!(item && (item.verified || site.preview));

// 미확정 배지 (프리뷰 빌드 전용)
const badge = (site, t) => (site.preview ? `<span class="badge-unverified">${esc(t.common.unverifiedBadge)}</span>` : '');

const list = (items, cls = '') => `<ul${cls ? ` class="${cls}"` : ''}>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

const cards = (items) => `<div class="cards">${items.map((i) => `
  <div class="card">
    <h3 class="card-title">${esc(i.title)}</h3>
    <p class="card-desc">${esc(i.desc)}</p>
  </div>`).join('')}</div>`;

const faq = (items, heading) => `
<section class="section" aria-labelledby="faq-h">
  <div class="container">
    <h2 id="faq-h">${esc(heading)}</h2>
    <div class="faq">${items.map((f) => `
      <details class="faq-item">
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join('')}</div>
  </div>
</section>`;

const steps = (items) => `<ol class="steps">${items.map((s) => `
  <li class="step"><strong>${esc(s.title)}</strong><span>${esc(s.desc)}</span></li>`).join('')}</ol>`;

module.exports = { esc, attr, rich, fill, pagePath, show, badge, list, cards, faq, steps };
