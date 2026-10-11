/* 루트 언어 선택 페이지: 브라우저 언어에 맞는 링크를 '추천'만 함. 자동 리디렉션 없음 (Google 지침). */
(function () {
  'use strict';
  var langs = (navigator.languages || [navigator.language || '']).map(function (l) { return String(l).toLowerCase().slice(0, 2); });
  var pick = null;
  for (var i = 0; i < langs.length; i++) { if (['ko', 'en', 'ja'].indexOf(langs[i]) >= 0) { pick = langs[i]; break; } }
  if (!pick) return;
  var box = document.querySelector('[data-lang-suggest]');
  var link = box && box.querySelector('[data-suggest-for="' + pick + '"]');
  if (!box || !link) return;
  var label = document.createElement('span');
  label.textContent = link.getAttribute('data-suggest-label') + ' ';
  box.insertBefore(label, link);
  link.hidden = false;
  box.hidden = false;
})();
