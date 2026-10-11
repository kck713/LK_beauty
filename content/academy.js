// 아카데미 콘텐츠 데이터 — 과정명·기간·정원·수강료·강사 경력·수강생 사례는 운영자 확인 후 verified:true 로 전환합니다.
// 과거 모집 글의 과정명·정원·가격을 현재값으로 재사용하지 않습니다.

'use strict';

module.exports = {
  courses: [
    {
      id: 'course-beginner',
      verified: false,
      track: 'beginner', // beginner | experienced
      name: { ko: '', en: '', ja: '' },
      duration: { ko: '', en: '', ja: '' },
      schedule: { ko: '', en: '', ja: '' },
      capacity: null,
      priceKRW: null,
      includes: { ko: [], en: [], ja: [] }, // 도구·모델·재교육 조건
      outcomes: { ko: [], en: [], ja: [] },
    },
    {
      id: 'course-hairstroke-advanced',
      verified: false,
      track: 'experienced',
      name: { ko: '', en: '', ja: '' },
      duration: { ko: '', en: '', ja: '' },
      schedule: { ko: '', en: '', ja: '' },
      capacity: null,
      priceKRW: null,
      includes: { ko: [], en: [], ja: [] },
      outcomes: { ko: [], en: [], ja: [] },
    },
  ],

  // 공식 커리큘럼 단계
  curriculum: { verified: false, steps: { ko: [], en: [], ja: [] } },

  // 교정 장면 영상: 자동재생 금지, 포스터 이미지 + 재생 버튼
  coachingVideos: [
    {
      id: 'coaching-placeholder-1',
      verified: false,
      poster: 'images/academy/coaching-1-poster.jpg',
      src: '',
      caption: { ko: '', en: '', ja: '' },
    },
  ],

  // 수강생 성장 사례: 수강 전 경력·과정·촬영 시점·지도 여부를 반드시 표기
  growthCases: [
    {
      id: 'growth-placeholder-1',
      verified: false,
      consent: false,
      before: 'images/academy/growth-1-before.jpg',
      after: 'images/academy/growth-1-after.jpg',
      priorExperience: { ko: '', en: '', ja: '' },
      course: '',
      beforeTakenAt: '',
      afterTakenAt: '',
      supervised: null, // 강사 지도 하 작업 여부
      note: { ko: '', en: '', ja: '' },
    },
  ],

  instructors: [
    {
      id: 'director',
      verified: false,
      name: { ko: '', en: '', ja: '' },
      role: { ko: '원장', en: 'Director', ja: '院長' },
      credentials: { ko: [], en: [], ja: [] }, // 검증 가능한 경력만
      photo: 'images/about/director.jpg',
    },
  ],

  // 수료 후 실제 지원 (확인 후 기재)
  postCompletionSupport: { verified: false, ko: [], en: [], ja: [] },
};
