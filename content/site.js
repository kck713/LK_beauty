// 사이트 전역 설정 — 운영 정보는 모두 이 파일에서 수정합니다.
// verified:false 인 항목은 공개 빌드에서 노출되지 않습니다 (PREVIEW=1 빌드에서만 '미확정' 배지와 함께 표시).

'use strict';

const env = process.env;

module.exports = {
  // 출시 전 확정. 기존 도메인 이력·검색 유입 확인 후 결정 (기획안 B).
  baseUrl: (env.SITE_URL || 'https://lkbeautyaxis.example').replace(/\/+$/, ''),

  brand: 'LK BEAUTY AXIS',
  // 공식 한글 표기는 미확정 (Lab/Axis 명칭 혼재 이슈). 확정 전까지 영문 표기만 사용.
  brandKo: { verified: false, value: '' },
  instagramHandle: '@lk_beautyaxis',

  languages: ['ko', 'en', 'ja'],
  defaultLang: 'ko',
  timezoneLabel: 'KST (UTC+9)',

  // 카카오 채널 소개에서 확인된 주소. 출시 전 운영자 재확인 필요 → verified:false.
  // 미확정 상태에서는 동(洞) 단위 지역명만 노출합니다.
  address: {
    verified: false,
    full: {
      ko: '서울 강남구 삼성로116길 5 3층',
      en: '3F, 5 Samseong-ro 116-gil, Gangnam-gu, Seoul, Korea',
      ja: 'ソウル特別市江南区三成路116ギル5 3階',
    },
    area: {
      ko: '서울 강남구 삼성동',
      en: 'Samseong-dong, Gangnam-gu, Seoul',
      ja: 'ソウル 江南区 三成洞',
    },
    mapUrl: null, // 확정된 지도 링크가 없으면 가짜 목적지를 만들지 않음
    parking: { verified: false, ko: '', en: '', ja: '' },
    nearestStation: { verified: false, ko: '', en: '', ja: '' },
  },

  hours: {
    verified: false,
    ko: '',
    en: '',
    ja: '',
  },

  // 실제 상담 지원 언어. 확인 전까지는 '확인 중' 문구를 노출하고 외국어 상담을 약속하지 않습니다.
  supportLanguages: {
    verified: false,
    consultation: [], // 예: ['ko']
    note: { ko: '', en: '', ja: '' },
  },

  channels: {
    instagram: { verified: true, url: 'https://www.instagram.com/lk_beautyaxis/', label: '@lk_beautyaxis' },
    // 공개 검색에서 확인된 카카오 채널. 운영 가능 여부 확인 후 verified:true 로 변경.
    kakao: { verified: false, url: 'https://pf.kakao.com/_DBTKs', label: 'KakaoTalk' },
    email: { verified: false, address: '' },
    phone: { verified: false, number: '', display: '' },
    whatsapp: { verified: false, url: '' },
    line: { verified: false, url: '' },
  },

  // 폼 접수 엔드포인트 (docs/FORM_API.md). 비어 있으면 접수 불가 안내를 표시하고 가짜 성공을 만들지 않습니다.
  form: {
    endpoint: env.FORM_ENDPOINT || '',
  },

  analytics: {
    gtmId: env.GTM_ID || '',
  },

  // 공개 빌드에서 미확정 항목을 숨길지 여부
  preview: env.PREVIEW === '1',

  // 개인정보 안내에 쓰는 값. 보관 기간 등은 운영자 확인 후 기재.
  privacy: {
    controller: 'LK BEAUTY AXIS',
    retention: { verified: false, ko: '', en: '', ja: '' },
    contact: { verified: false, ko: '', en: '', ja: '' },
    lastUpdated: '2026-10-11',
  },
};
