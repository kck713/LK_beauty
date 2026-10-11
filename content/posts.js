// 소식·이벤트·프로모션 게시 데이터
// - type: 'news' | 'event' | 'promotion'
// - 언어별 slug/title 이 있는 언어에서만 게시됩니다 (한국어 전용 교육 소식 허용). 있는 언어끼리 hreflang 으로 연결됩니다.
// - verified:false 는 공개 빌드에서 제외. 실제 일정·정원·조건은 운영자 확인 후 기재.
// - modal: 진입 팝업으로 노출할 때만 enabled:true (기간 내에만 표시). 한 번에 하나만 활성화하세요.

'use strict';

module.exports = [
  {
    id: 'sample-seminar',
    type: 'event',
    verified: false,
    publishedAt: '2026-11-01',
    image: 'images/posts/sample-seminar.jpg', // content/assets.js 에 등록, status:'ready' 일 때만 사용
    slug: { ko: 'hairstroke-seminar', en: 'hairstroke-seminar', ja: 'hairstroke-seminar' },
    title: { ko: '', en: '', ja: '' },
    summary: { ko: '', en: '', ja: '' },
    body: { ko: [], en: [], ja: [] }, // 문단 배열
    event: {
      startsAt: '',        // ISO8601 with +09:00
      endsAt: '',
      location: { ko: '', en: '', ja: '' },
      capacity: null,      // 정원 (숫자). 잔여석은 서버/운영자 확인값 seatsLeft 로 별도 표시
      seatsLeft: null,
      registrationOpen: false,
      businessUnit: 'academy', // 신청 데이터의 business_unit 분류 보조값
      country: 'KR',            // 개최 국가(ISO). 해외 마스터클래스 추후 구현용, 현재 미표시
      teachingLanguages: ['ko'], // 개최 언어. 추후 구현용, 현재 미표시
    },
    promotion: null, // { validUntil: 'YYYY-MM-DD', terms: { ko: [], en: [], ja: [] } }
    modal: { enabled: false, from: '', until: '' },
  },
];
