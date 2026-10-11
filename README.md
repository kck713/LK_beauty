# LK BEAUTY AXIS — 랜딩 사이트 (ko / en / ja)

기획안 `LK_Beauty_Axis_Landing_Strategy v0.4` 를 기준으로 제작한 정적 사이트입니다.
방한 미국·일본 시술 고객(영어·일본어 스튜디오 페이지)과 한국인 수강생(한국어 아카데미 페이지)을 주 전환 경로로 두되, 전체 사이트를 세 언어로 제공합니다.

- 의존성 없음 (Node 18+). `npm run build` → `dist/`
- 모든 문구·운영 정보·가격·이미지 매핑은 `content/` 한 곳에서 수정
- 운영자 확인 전 정보는 `verified: false` 로 관리되어 **공개 빌드에서 노출되지 않음**

## 구조

```
content/
  site.js          운영 정보(주소·시간·채널·지원 언어·폼 엔드포인트·분석)
  i18n/{ko,en,ja}.js  모든 문구 (키 구조 동일, 빌드 시 검증)
  studio.js        시술 메뉴·사례·가격 (verified 플래그)
  academy.js       과정·커리큘럼·영상·성장 사례·강사 (verified 플래그)
  assets.js        이미지 자산 매핑과 상태
src/
  build.js         SSG (hreflang·canonical·sitemap·robots·404 생성)
  templates/       layout, pages, helpers
  styles/main.css  모바일 우선, reduced-motion, 44px 터치 영역
  scripts/main.js  내비·탭·폼·UTM·이벤트 (PII 미전송)
  scripts/root.js  루트 언어 추천(리디렉션 없음)
public/            정적 자산 (images/ 등) → dist/ 로 복사
api/lead.example.js  참고용 접수 핸들러
scripts/serve.js   개발 서버 (실제 404 응답)
scripts/qa.js      출시 QA 자동 검사
docs/              MISSING_INFO · EVENTS · FORM_API · DEPLOY · QA
```

## URL 구조

| 페이지 | ko | en | ja |
|---|---|---|---|
| 언어 선택 | `/` | | |
| 홈 | `/ko/` | `/en/` | `/ja/` |
| 스튜디오 | `/ko/studio/` | `/en/studio/` | `/ja/studio/` |
| 아카데미 | `/ko/academy/` | `/en/academy/` | `/ja/academy/` |
| 소개 | `/ko/about/` | `/en/about/` | `/ja/about/` |
| 상담 | `/ko/contact/` (`#studio` / `#academy`) | `/en/contact/` | `/ja/contact/` |
| 개인정보 | `/ko/privacy/` | `/en/privacy/` | `/ja/privacy/` |
| 접수 완료 (noindex) | `/ko/contact/thanks/` | `/en/contact/thanks/` | `/ja/contact/thanks/` |

광고 도착점: 영어·일본어 시술 → `/en/studio/`, `/ja/studio/` / 한국어 교육 → `/ko/academy/`. 홈은 광고 도착점으로 쓰지 않습니다.

## 명령

```bash
npm run build          # 공개 빌드 (미확정 항목 숨김)
npm run build:preview  # 내부 검토용 (미확정 항목을 배지와 함께 표시)
npm run dev            # http://localhost:4173
npm run qa             # 출시 QA 검사
npm test               # build + qa
```

환경변수는 `.env.example` 참고 (`SITE_URL`, `FORM_ENDPOINT`, `GTM_ID`).

## 디자인 방향 (v2)

참고 레퍼런스를 바탕으로 한 아트디렉션: 흰 배경, 딥 틸(`--primary`) 주색, 버건디(`--accent`) 포인트, 세리프 디스플레이 제목(Playfair Display + Noto Serif KR/JP), 산세리프 본문(Montserrat + 시스템 CJK), 각진 버튼·입력창, 중앙 정렬 로고와 섹션 제목.
색상은 `src/styles/main.css` 상단의 토큰만 바꾸면 전체에 반영됩니다. 로고가 확정되면 헤더의 워드마크(`.brand`)를 이미지로 교체하세요.
웹폰트는 Google Fonts(`display=swap`)를 언어별로 최소 가중치만 로드합니다. 히어로 이미지는 `content/assets.js`에서 `status: 'ready'`로 바꾸면 자동으로 2단 레이아웃(이미지+카피)으로 전환됩니다.

## 운영 정보 채우기

1. `docs/MISSING_INFO.md` 의 목록을 확인
2. 해당 `content/*.js` 에 값을 넣고 `verified: true`
3. 이미지는 `public/images/...` 에 넣고 `content/assets.js` 의 `status: 'ready'`
4. `npm test` 로 검증 후 배포 (`docs/DEPLOY.md`)
