// 스튜디오 콘텐츠 데이터 — 시술 메뉴·사례·가격은 운영자 확인 후 verified:true 로 전환합니다.
// 사례 이미지는 원본을 사용하며 결과를 바꾸는 보정을 하지 않습니다. 촬영 시점(stage)을 반드시 기록합니다.

'use strict';

module.exports = {
  // 현재 운영 시술 메뉴. 확인 전 공개 금지.
  services: [
    {
      id: 'brow-hairstroke',
      verified: false,
      name: { ko: '눈썹 헤어스트록', en: 'Hair-stroke brows', ja: '眉ヘアストローク' },
      summary: { ko: '', en: '', ja: '' },
      priceKRW: null,          // 실제 결제 통화 기준
      retouchIncluded: null,   // true/false/조건 문자열
      retouchTerms: { ko: '', en: '', ja: '' },
    },
    {
      id: 'eyeliner',
      verified: false,
      name: { ko: '아이라인', en: 'Eyeliner', ja: 'アイライン' },
      summary: { ko: '', en: '', ja: '' },
      priceKRW: null,
      retouchIncluded: null,
      retouchTerms: { ko: '', en: '', ja: '' },
    },
    {
      id: 'lips',
      verified: false,
      name: { ko: '입술', en: 'Lips', ja: 'リップ' },
      summary: { ko: '', en: '', ja: '' },
      priceKRW: null,
      retouchIncluded: null,
      retouchTerms: { ko: '', en: '', ja: '' },
    },
  ],

  // 실제 작업 사례. image: public/images/ 하위 경로. stage: 'immediate' | 'healed' | 'after-retouch'
  cases: [
    {
      id: 'case-placeholder-1',
      verified: false,
      serviceId: 'brow-hairstroke',
      image: 'images/cases/placeholder.jpg',
      alt: { ko: '', en: '', ja: '' },
      stage: 'healed',
      takenAt: '',            // YYYY-MM
      consent: false,         // 고객 사용 동의 기록
      reason: { ko: '', en: '', ja: '' }, // 디자인 선택 이유
    },
  ],

  // 환율 참고 표시 (선택). 사용 시 기준일 명시.
  fxReference: { verified: false, asOf: '', usdPerKrw: null, jpyPerKrw: null },
};
