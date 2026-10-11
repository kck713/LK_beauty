// 개발·QA 전용 샘플 데이터. FIXTURES=1 빌드에서만 콘텐츠에 병합됩니다.
// 실제 운영 정보가 아니며, 레이아웃·동선 확인 목적입니다. 공개 빌드에 절대 포함하지 마세요 (QA 가 차단).
'use strict';

module.exports = function applyFixtures({ posts, testimonials, studio, academy }) {
  posts.length = 0;
  posts.push({
    id: 'fx-seminar', type: 'event', verified: true, publishedAt: '2026-10-01', image: 'images/posts/sample-seminar.jpg',
    slug: { ko: 'hairstroke-seminar', en: 'hairstroke-seminar', ja: 'hairstroke-seminar' },
    title: { ko: '[샘플] 헤어스트록 디자인 세미나', en: '[Sample] Hair-stroke design seminar', ja: '[サンプル] ヘアストローク デザインセミナー' },
    summary: { ko: '샘플 요약 문구입니다. 실제 행사가 아닙니다.', en: 'Sample summary. Not a real event.', ja: 'サンプルの要約です。実際のイベントではありません。' },
    body: { ko: ['샘플 본문 문단 1.', '샘플 본문 문단 2.'], en: ['Sample paragraph 1.', 'Sample paragraph 2.'], ja: ['サンプル本文1。', 'サンプル本文2。'] },
    event: { startsAt: '2026-12-05T14:00:00+09:00', endsAt: '2026-12-05T17:00:00+09:00', location: { ko: '서울 강남구 삼성동', en: 'Samseong-dong, Seoul', ja: 'ソウル 三成洞' }, capacity: 12, seatsLeft: 5, registrationOpen: true, businessUnit: 'academy' },
    promotion: null,
    modal: { enabled: true, from: '2026-10-01', until: '2026-12-05' },
  }, {
    id: 'fx-news-ko', type: 'news', verified: true, publishedAt: '2026-09-20', image: '',
    slug: { ko: 'notice-sample', en: null, ja: null },
    title: { ko: '[샘플] 한국어 전용 소식', en: '', ja: '' },
    summary: { ko: '한국어로만 게시되는 소식 샘플.', en: '', ja: '' },
    body: { ko: ['한국어 전용 본문.'], en: [], ja: [] }, event: null, promotion: null, modal: { enabled: false },
  });
  testimonials.length = 0;
  testimonials.push(
    { id: 'fx-t1', verified: true, consent: true, compensated: false, unit: 'studio', displayName: 'J.K.', context: { ko: '헤어스트록 · 탈각 후', en: 'Hair-stroke · healed', ja: 'ヘアストローク · 定着後' }, quote: { ko: '[샘플] 후기 문장입니다.', en: '[Sample] A testimonial sentence.', ja: '[サンプル] 感想の文章です。' }, sourceUrl: '', date: '2026-08' },
    { id: 'fx-t2', verified: true, consent: true, compensated: true, unit: 'academy', displayName: '', context: { ko: '입문 과정', en: 'Beginner course', ja: '入門コース' }, quote: { ko: '[샘플] 수강생 후기.', en: '[Sample] Student testimonial.', ja: '[サンプル] 受講生の声。' }, sourceUrl: '', date: '2026-07' },
  );
  const sv = studio.services[0];
  sv.verified = true; sv.priceKRW = 350000; sv.retouchTerms = { ko: '1회 리터치 포함(샘플)', en: 'One retouch included (sample)', ja: 'リタッチ1回含む（サンプル）' };
  sv.summary = { ko: '샘플 요약', en: 'Sample summary', ja: 'サンプル要約' };
  const mk = (l) => ({ intro: { ko: '[샘플] 결을 따라 한 올씩 그리는 눈썹.', en: '[Sample] Brows drawn stroke by stroke along the hair flow.', ja: '[サンプル] 毛流れに沿って一本ずつ描く眉。' }[l], forWhom: ['A', 'B'], process: [{ title: 'Step 1', desc: 'desc' }, { title: 'Step 2', desc: 'desc' }], aftercare: ['care 1'], faq: [{ q: 'Q?', a: 'A.' }] });
  sv.detail = { ko: mk('ko'), en: mk('en'), ja: mk('ja') };
  const c = academy.courses[0];
  c.verified = true; c.name = { ko: '[샘플] 입문 과정', en: '[Sample] Beginner course', ja: '[サンプル] 入門コース' };
  c.duration = { ko: '8주', en: '8 weeks', ja: '8週間' }; c.schedule = { ko: '주 2회', en: 'Twice a week', ja: '週2回' }; c.capacity = 4; c.priceKRW = 2500000;
  c.includes = { ko: ['도구 세트'], en: ['Tool kit'], ja: ['道具セット'] }; c.outcomes = { ko: ['기본 결 구현'], en: ['Basic strokes'], ja: ['基本の毛流れ'] };
  c.detail = { ko: mk('ko'), en: mk('en'), ja: mk('ja') };
};
