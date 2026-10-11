// 사이트 전역 설정 로더 — 운영 정보는 content/data/site.json (CMS 편집 가능), 환경·언어 설정은 여기.
// verified:false 인 항목은 공개 빌드에서 노출되지 않습니다 (PREVIEW=1 빌드에서만 '미확정' 배지와 함께 표시).
'use strict';

const env = process.env;
const data = require('./data/site.json');

module.exports = {
  // 출시 전 확정. 기존 도메인 이력·검색 유입 확인 후 결정 (기획안 B).
  baseUrl: (env.SITE_URL || 'https://lkbeautyaxis.example').replace(/\/+$/, ''),

  languages: ['ko', 'en', 'ja'],
  defaultLang: 'ko',
  timezoneLabel: 'KST (UTC+9)',

  // 폼 접수 엔드포인트 (docs/FORM_API.md). 비어 있으면 접수 불가 안내를 표시하고 가짜 성공을 만들지 않습니다.
  form: { endpoint: env.FORM_ENDPOINT || '' },
  analytics: { gtmId: env.GTM_ID || '' },
  // 공개 빌드에서 미확정 항목을 숨길지 여부
  preview: env.PREVIEW === '1',

  // ---- 이하 CMS 편집 영역 (content/data/site.json) ----
  brand: data.brand,
  brandKo: data.brandKo,
  instagramHandle: data.instagramHandle,
  address: data.address,
  hours: data.hours,
  supportLanguages: data.supportLanguages,
  channels: data.channels,
  privacy: data.privacy,
};
