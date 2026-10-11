// 필요한 이미지 자산 체크리스트 — 실제 파일이 public/images/ 경로에 존재하면 빌드가 자동으로 사용합니다 (CMS 업로드 포함).
// status 값은 참고용이며 빌드 판정에는 쓰지 않습니다. dist/build-report.json 의 missingAssets 로 누락을 확인하세요.

'use strict';

module.exports = {
  'images/og/default.jpg': { status: 'ready', note: '1200×630 OG 이미지. 로고 기반. 텍스트 최소화.', usedBy: ['all pages'] },
  'images/og/studio.jpg': { status: 'ready', note: '스튜디오용 OG. 대표 작업 1개(동의 확인).', usedBy: ['/*/studio/'] },
  'images/og/academy.jpg': { status: 'ready', note: '아카데미용 OG. 교정 장면.', usedBy: ['/*/academy/'] },
  'images/logo.svg': { status: 'missing', note: '기존 로고 원본. 포인트색 추출 기준.', usedBy: ['header', 'favicon'] },
  'images/home/hero.jpg': { status: 'ready', note: '홈 첫 화면. 2026-10-11 운영자 제공 모델 이미지(실제 고객·작업 아님). 1600px JPG+WebP. 사용권 확인 필요.', usedBy: ['/*/'] },
  'images/studio/hero.jpg': { status: 'ready', note: '운영자 제공 모델 이미지(실제 작업 아님). 실제 대표 작업 사진 확보 시 교체. 1200×1500 JPG+WebP.', usedBy: ['/*/studio/'] },
  'images/cases/placeholder.jpg': { status: 'missing', note: '사례 3~6개. 직후/탈각 후/리터치 후 구분.', usedBy: ['/*/studio/'] },
  'images/academy/hero.jpg': { status: 'ready', note: '운영자 제공 모델 이미지. 실제 교정 장면 사진 확보 시 교체. 1600px JPG+WebP.', usedBy: ['/*/academy/'] },
  'images/academy/coaching-1-poster.jpg': { status: 'missing', note: '교정 영상 포스터. 자동재생 금지.', usedBy: ['/*/academy/'] },
  'images/academy/growth-1-before.jpg': { status: 'missing', note: '수강생 작업 전. 동의·촬영 시점 필수.', usedBy: ['/*/academy/'] },
  'images/academy/growth-1-after.jpg': { status: 'missing', note: '수강생 작업 후. 동의·촬영 시점 필수.', usedBy: ['/*/academy/'] },
  'images/about/director.jpg': { status: 'missing', note: '원장 사진.', usedBy: ['/*/about/'] },
  'images/posts/sample-seminar.jpg': { status: 'missing', note: '이벤트 배너 1600×900. 팝업·목록·상세 공용.', usedBy: ['/*/news/*'] },
  'images/about/space-1.jpg': { status: 'missing', note: '공간·위생 절차 사진.', usedBy: ['/*/about/'] },
};
