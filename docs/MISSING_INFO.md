# 미확정 운영 정보·자산 목록 (출시 전 확인 필요)

기획안 §13·F 기준. 아래 항목은 코드에 `verified: false` 로 관리되며 **공개 빌드에서 노출되지 않습니다.**
`npm run build:preview` 로 빌드하면 '미확정' 배지와 함께 내부 검토용으로 볼 수 있습니다.
값을 확인하면 해당 파일에서 내용을 채우고 `verified: true` 로 바꾸면 됩니다.

## 우선순위 1 — 상담·전환에 직접 영향

| 항목 | 파일 | 현재 상태 | 미확정 시 사이트 표시 |
|---|---|---|---|
| 폼 접수 엔드포인트 | `.env` → `FORM_ENDPOINT` | 미설정 | "온라인 접수 준비 중" 안내 + 인스타그램 경로 |
| 사이트 도메인 | `.env` → `SITE_URL` | placeholder | canonical/hreflang/sitemap 에 placeholder 도메인 |
| 상담 지원 언어(영/일 상담 가능 여부·방식) | `content/site.js` → `supportLanguages` | 미확인 | "페이지 언어 ≠ 상담 언어, 확인 후 안내" 문구 |
| 운영시간·답변 가능 시간 | `content/site.js` → `hours` | 미확인 | "운영시간은 확인 후 게시" |
| 상세 주소 (삼성로116길 5 3층, 카카오 채널 기준) | `content/site.js` → `address` | 재확인 필요 | 동 단위(삼성동)만 표시, 상세는 예약 시 안내 |
| 현재 시술 메뉴·설명 | `content/studio.js` → `services` | 미확인 | "메뉴는 확인 후 게시" |
| 시술 가격(KRW)·리터치 포함 조건·예약금·취소 조건 | `content/studio.js` → `services[].priceKRW`, `retouchTerms` | 미확인 | "상담 시 안내, 결제는 KRW" |
| 아카데미 과정명·기간·일정·정원·수강료·포함 도구 | `content/academy.js` → `courses` | 미확인 (과거 모집 글 수치 재사용 금지) | "확인 후 게시, 상담 시 현재 기준 안내" |
| 보조 문의 경로 (카카오 채널 운영 여부, 이메일, 전화, WhatsApp, LINE) | `content/site.js` → `channels` | 인스타만 확정 | 인스타그램만 노출 |

## 우선순위 2 — 신뢰·증거 자료

| 항목 | 파일 | 비고 |
|---|---|---|
| 로고 원본·브랜드 가이드·포인트색 | `public/images/logo.svg`, `src/styles/main.css` `--accent` | 현재 임시 'LK' 마크·갈색 포인트 |
| 공식 한글 표기 (Lab / Axis 명칭 정리) | `content/site.js` → `brandKo` | 확정 전 영문만 사용 |
| 실제 작업 사례 3~6개 (원본, 촬영 시점, 디자인 이유, 사용 동의) | `content/studio.js` → `cases`, `public/images/cases/` | 직후/탈각 후/리터치 후 구분 |
| 교정 장면 영상 2~3개 + 포스터 | `content/academy.js` → `coachingVideos` | 자동재생 금지 |
| 수강생 성장 사례 (전/후, 경력, 과정, 촬영 시점, 지도 여부, 동의) | `content/academy.js` → `growthCases` | |
| 원장·강사 경력 근거 | `content/academy.js` → `instructors` | 검증 가능한 경력만 |
| 공식 커리큘럼 단계 | `content/academy.js` → `curriculum` | |
| 수료 후 실제 지원 | `content/academy.js` → `postCompletionSupport` | |
| 공간·위생 절차 사진 | `content/assets.js` | |
| OG 이미지 3종 (기본/스튜디오/아카데미) | `content/assets.js` | 없으면 og:image 생략 |
| 후기 원문·사용 동의·대가 여부 | `content/testimonials.js` | `verified && consent` 일 때만 노출. 번역 없는 언어에선 숨김 |
| 시술 상세 페이지 본문 (3개 언어) | `content/studio.js` → `services[].detail` | 세 언어 모두 채워져야 생성 |
| 과정 상세 페이지 본문 (3개 언어) | `content/academy.js` → `courses[].detail` | 세 언어 모두 채워져야 생성 |
| 세미나·이벤트·프로모션 게시물 | `content/posts.js` | 언어별 부분 게시 가능. 팝업은 `modal.enabled` |
| 지도 임베드 URL | `content/site.js` → `address.mapEmbedUrl` | 주소 verified 일 때만 표시 |

## 우선순위 3 — 정책·측정

| 항목 | 파일 |
|---|---|
| 개인정보 보관 기간·담당자 연락처 | `content/site.js` → `privacy.retention`, `privacy.contact` |
| GTM 컨테이너 ID / GA4·광고 태그 | `.env` → `GTM_ID`, `docs/EVENTS.md` |
| 일본어 문구 원어민 검수 | `content/i18n/ja.js` |
| 영어 문구 최종 검수 | `content/i18n/en.js` |
| 지도 링크·주차·가까운 역 | `content/site.js` → `address.mapUrl`, `parking`, `nearestStation` |

## 자산 상태 확인
`dist/build-report.json` 에 빌드 시점의 누락 자산·미확정 항목이 기록됩니다.
