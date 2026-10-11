/* LK BEAUTY AXIS — 클라이언트 스크립트 (의존성 없음)
 * - 내비 토글, 탭, 언어 전환 없음(서버 링크)
 * - 이벤트: cta_click / contact_click / form_start / lead_submit (서버 성공 후에만)
 * - UTM: first-touch(localStorage) / last-touch(sessionStorage) 보존 → 폼 hidden 필드
 * - 폼: 검증, 허니팟, 중복 제출 방지(lead_key), 엔드포인트 미설정 시 가짜 성공 금지
 * - 개인정보(이름·연락처·메시지)는 분석 이벤트에 절대 포함하지 않음
 */
(function () {
  'use strict';
  var LK = window.__LK || {};
  var dl = (window.dataLayer = window.dataLayer || []);

  function track(event, params) {
    var base = { event: event, page_language: LK.pageLanguage, page_type: LK.pageType, business_unit: LK.businessUnit };
    var p = params || {};
    for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) base[k] = p[k];
    dl.push(base);
  }

  // ---------- UTM / campaign ----------
  function parseQuery() {
    var out = {};
    var q = location.search.replace(/^\?/, '');
    if (!q) return out;
    q.split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i)).toLowerCase();
      var v = decodeURIComponent(i < 0 ? '' : kv.slice(i + 1).replace(/\+/g, ' '));
      if (/^(utm_source|utm_medium|utm_campaign|utm_content|utm_term|campaign_id|gclid|fbclid)$/.test(k)) out[k] = v.slice(0, 200);
    });
    return out;
  }
  function safeGet(store, key) { try { return JSON.parse(store.getItem(key) || 'null'); } catch (e) { return null; } }
  function safeSet(store, key, val) { try { store.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } }

  var current = parseQuery();
  var hasUtm = Object.keys(current).length > 0;
  var last = hasUtm ? current : (safeGet(sessionStorage, 'lk_utm_last') || {});
  if (hasUtm) safeSet(sessionStorage, 'lk_utm_last', current);
  var first = safeGet(localStorage, 'lk_utm_first');
  if (!first && hasUtm) { first = current; safeSet(localStorage, 'lk_utm_first', first); }
  first = first || {};
  var landing = safeGet(sessionStorage, 'lk_landing');
  if (!landing) { landing = { path: location.pathname, referrer: document.referrer || '' }; safeSet(sessionStorage, 'lk_landing', landing); }

  var campaignId = last.campaign_id || last.utm_campaign || '';

  // ---------- Nav toggle ----------
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    });
  }

  // ---------- CTA / contact clicks ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-cta], a[data-contact]');
    if (!a) return;
    if (a.hasAttribute('data-cta')) {
      track('cta_click', { cta_location: a.getAttribute('data-cta'), business_unit: a.getAttribute('data-unit') || LK.businessUnit, campaign_id: campaignId });
    } else {
      track('contact_click', { contact_channel: a.getAttribute('data-contact'), campaign_id: campaignId });
    }
  });

  // ---------- Tabs (contact) ----------
  var tabs = document.querySelector('[data-tabs]');
  if (tabs) {
    var tabButtons = Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(tabs.querySelectorAll('[role="tabpanel"]'));
    function selectTab(name, focus) {
      tabButtons.forEach(function (b) {
        var on = b.getAttribute('data-tab') === name;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      panels.forEach(function (p) { p.hidden = p.id !== name; });
      LK.businessUnit = name;
    }
    tabButtons.forEach(function (b) {
      b.addEventListener('click', function () { selectTab(b.getAttribute('data-tab'), false); history.replaceState(null, '', '#' + b.getAttribute('data-tab')); });
      b.addEventListener('keydown', function (e) {
        var i = tabButtons.indexOf(b);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length;
          selectTab(tabButtons[n].getAttribute('data-tab'), true);
        }
      });
    });
    var initial = (location.hash || '').replace('#', '');
    if (initial === 'academy' || initial === 'studio') selectTab(initial, false);
    window.addEventListener('hashchange', function () {
      var h = (location.hash || '').replace('#', '');
      if (h === 'academy' || h === 'studio') selectTab(h, false);
    });
  }

  // ---------- Thanks page copy ----------
  var thanksEl = document.querySelector('[data-thanks-unit]');
  if (thanksEl) {
    var unit = (location.search.match(/[?&]unit=(studio|academy)/) || [])[1];
    if (unit) thanksEl.textContent = thanksEl.getAttribute('data-' + unit) || '';
    else thanksEl.hidden = true;
  }

  // ---------- Forms ----------
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });
  }
  function setHidden(form, name, value) { var el = form.querySelector('input[name="' + name + '"]'); if (el) el.value = value || ''; }
  function fieldError(form, name, msg) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return;
    var err = document.getElementById(el.id + '-error');
    if (msg) { el.setAttribute('aria-invalid', 'true'); if (err) { err.textContent = msg; err.hidden = false; } }
    else { el.removeAttribute('aria-invalid'); if (err) { err.textContent = ''; err.hidden = true; } }
  }
  function looksLikeContact(v) {
    v = v.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return true;            // email
    if (/^\+?[\d\s().-]{7,20}$/.test(v) && (v.replace(/\D/g, '').length >= 7)) return true; // phone
    if (/^@?[A-Za-z0-9._]{3,30}$/.test(v)) return true;                 // handle
    return false;
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-lead-form]'), function (form) {
    var unit = form.getAttribute('data-unit');
    var started = false;
    var submitting = false;
    var leadKey = uuid();
    var submitBtn = form.querySelector('button[type="submit"]');
    var summary = form.querySelector('[data-form-summary]');

    setHidden(form, 'lead_key', leadKey);
    setHidden(form, 'campaign_id', campaignId);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { setHidden(form, k, last[k]); });
    setHidden(form, 'first_utm_source', first.utm_source);
    setHidden(form, 'first_utm_medium', first.utm_medium);
    setHidden(form, 'first_utm_campaign', first.utm_campaign);
    setHidden(form, 'referrer', landing.referrer);
    setHidden(form, 'landing_path', landing.path);

    form.addEventListener('input', function () {
      if (started) return;
      started = true;
      track('form_start', { business_unit: unit, campaign_id: campaignId });
    }, { once: false });

    // 오류 문구는 페이지에 렌더된 data 속성 대신 전역 i18n 객체에서 읽음 (아래 주입)
    var msgs = (window.__LK_FORM_MESSAGES || {});

    function validate() {
      var ok = true;
      var firstBad = null;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (el) {
        var v = el.type === 'checkbox' ? el.checked : el.value.trim();
        var msg = '';
        if (!v) msg = el.type === 'checkbox' ? msgs.consent : msgs.required;
        else if (el.name === 'name' && el.value.trim().length < 2) msg = msgs.nameShort;
        else if (el.name === 'contact' && !looksLikeContact(el.value)) msg = msgs.contactInvalid;
        fieldError(form, el.name, msg);
        if (msg) { ok = false; if (!firstBad) firstBad = el; }
      });
      if (summary) { summary.textContent = ok ? '' : msgs.summary; summary.hidden = ok; }
      if (firstBad) firstBad.focus();
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;
      if (form.hasAttribute('data-no-endpoint')) {
        if (summary) { summary.textContent = msgs.network; summary.hidden = false; }
        return;
      }
      if (!validate()) return;
      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value) { if (summary) { summary.textContent = msgs.spam; summary.hidden = false; } return; }

      submitting = true;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = submitBtn.getAttribute('data-submitting-label') || submitBtn.textContent; }

      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== 'website') data[k] = typeof v === 'string' ? v.trim() : v; });
      data.consent_required = data.consent_required === 'yes';
      data.consent_marketing = data.consent_marketing === 'yes';
      data.submitted_at = new Date().toISOString();

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'omit',
      }).then(function (res) {
        if (res.status === 409) throw new Error('duplicate');
        if (!res.ok) throw new Error('http_' + res.status);
        return res.json().catch(function () { return {}; });
      }).then(function (body) {
        // 서버 저장 성공 후에만 전환 이벤트 발생. 개인정보 미포함.
        track('lead_submit', {
          business_unit: unit,
          campaign_id: campaignId,
          service_id: data.service_interest || data.course_interest || '',
          preferred_language: data.preferred_language || '',
          lead_id: (body && body.lead_id) || leadKey,
        });
        var url = LK.thanksPath + '?unit=' + encodeURIComponent(unit);
        location.assign(url);
      }).catch(function (err) {
        submitting = false;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.getAttribute('data-submit-label') || submitBtn.textContent; }
        var m = err && err.message === 'duplicate' ? msgs.duplicate : msgs.network;
        if (summary) { summary.textContent = m; summary.hidden = false; summary.focus && summary.focus(); }
        track('lead_submit_error', { business_unit: unit, error_type: (err && err.message) || 'unknown' });
      });
    });
  });
})();
