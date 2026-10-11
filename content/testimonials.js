// 고객·수강생 후기 — 원문 링크·사용 동의·대가 여부를 기록합니다. verified && consent 인 항목만 공개됩니다.
// 후기를 생성하거나 각색하지 않습니다. 번역이 없는 언어에서는 표시되지 않습니다.

'use strict';

module.exports = [
  {
    id: 'sample-1',
    verified: false,
    consent: false,
    compensated: false,
    unit: 'studio',            // 'studio' | 'academy'
    displayName: '',           // 예: '김○○' / 'J.K.' (동의한 표기만)
    context: { ko: '', en: '', ja: '' }, // 예: '헤어스트록 · 2026-05 · 탈각 후'
    quote: { ko: '', en: '', ja: '' },
    sourceUrl: '',             // 원문(인스타 댓글·인터뷰 등) 기록용, 비공개
    date: '',
  },
];
