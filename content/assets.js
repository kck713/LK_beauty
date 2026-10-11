// 이미지 자산 매핑 — 실제 파일을 public/images/ 에 넣고 status 를 'ready' 로 바꿉니다.
// 빌드 시 status 가 'ready' 가 아닌 자산을 참조하는 섹션은 공개 빌드에서 렌더링되지 않습니다.

'use strict';

module.exports = {
  'images/og/default.png': { status: 'missing', note: '1200×630 OG 이미지. 로고 기반. 텍스트 최소화.', usedBy: ['all pages'] },
  'images/og/studio.png': { status: 'missing', note: '스튜디오용 OG. 대표 작업 1개(동의 확인).', usedBy: ['/*/studio/'] },
  'images/og/academy.png': { status: 'missing', note: '아카데미용 OG. 교정 장면.', usedBy: ['/*/academy/'] },
  'images/logo.svg': { status: 'missing', note: '기존 로고 원본. 포인트색 추출 기준.', usedBy: ['header', 'favicon'] },
  'images/home/hero.jpg': { status: 'missing', note: '홈 첫 화면. 실제 작업/사람 중심. 1600px, WebP 병행.', usedBy: ['/*/'] },
  'images/studio/hero.jpg': { status: 'missing', note: '대표 작업 1개. 촬영 시점 기록.', usedBy: ['/*/studio/'] },
  'images/cases/placeholder.jpg': { status: 'missing', note: '사례 3~6개. 직후/탈각 후/리터치 후 구분.', usedBy: ['/*/studio/'] },
  'images/academy/hero.jpg': { status: 'missing', note: '교정 장면(손·설명 보이게).', usedBy: ['/*/academy/'] },
  'images/academy/coaching-1-poster.jpg': { status: 'missing', note: '교정 영상 포스터. 자동재생 금지.', usedBy: ['/*/academy/'] },
  'images/academy/growth-1-before.jpg': { status: 'missing', note: '수강생 작업 전. 동의·촬영 시점 필수.', usedBy: ['/*/academy/'] },
  'images/academy/growth-1-after.jpg': { status: 'missing', note: '수강생 작업 후. 동의·촬영 시점 필수.', usedBy: ['/*/academy/'] },
  'images/about/director.jpg': { status: 'missing', note: '원장 사진.', usedBy: ['/*/about/'] },
  'images/about/space-1.jpg': { status: 'missing', note: '공간·위생 절차 사진.', usedBy: ['/*/about/'] },
};
