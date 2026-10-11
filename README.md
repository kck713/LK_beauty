# LK BEAUTY AXIS — 랜딩 사이트 (ko / en / ja)

기획안 `LK_Beauty_Axis_Landing_Strategy v0.4` 를 기준으로 제작한 정적 사이트입니다.
방한 미국·일본 시술 고객(영어·일본어 스튜디오 페이지)과 한국인 수강생(한국어 아카데미 페이지)을 주 전환 경로로 두되, 전체 사이트를 세 언어로 제공합니다.

- 의존성 없음 (Node 18+). `npm run build` → `dist/`
- 모든 문구·운영 정보·가격·이미지 매핑은 `content/` 한 곳에서 수정
- 운영자 확인 전 정보는 `verified: false` 로 관리되어 **공개 빌드에서 노출되지 않음**

## 구조

```
content/
  data/site.json      운영 정보(주소·시간·채널·지원 언어·개인정보)  ← CMS 편집
  data/studio.json    시술 메뉴·가격·사례·시술 상세              ← CMS 편집
  data/academy.json   과정·커리큘럼·영상·성장 사례·강사·과정 상세 ← CMS 편집
  posts/*.json        소식·이벤트·프로모션, 진입 팝업 설정        ← CMS 편집
  testimonials/*.json 고객·수강생 후기 (verified + consent)      ← CMS 편집
  i18n/{ko,en,ja}.js  모든 UI 문구 (개발자 영역, 키 구조 빌드 시 검증)
  site.js 등 *.js     JSON 로더 + 환경변수(도메인·폼·분석)
  assets.js           필요한 이미지 체크리스트
public/admin/         Decap CMS (index.html, config.yml)
src/
  build.js         SSG (hreflang·canonical·sitemap·robots·404 생성)
  templates/       layout, pages, extras(후기·소식·상세·팝업), helpers
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
| 소식·이벤트 (게시물 있을 때) | `/ko/news/`, `/ko/news/{slug}/` | `/en/news/…` | `/ja/news/…` |
| 시술 상세 (3개 언어 모두 준비 시) | `/ko/studio/{slug}/` | `/en/studio/{slug}/` | `/ja/studio/{slug}/` |
| 과정 상세 (3개 언어 모두 준비 시) | `/ko/academy/{slug}/` | `/en/academy/{slug}/` | `/ja/academy/{slug}/` |

광고 도착점: 영어·일본어 시술 → `/en/studio/`, `/ja/studio/` / 한국어 교육 → `/ko/academy/`. 홈은 광고 도착점으로 쓰지 않습니다.

## 명령

```bash
npm run build          # 공개 빌드 (미확정 항목 숨김)
npm run build:preview  # 내부 검토용 (미확정 항목을 배지와 함께 표시)
npm run dev            # http://localhost:4173
npm run qa             # 출시 QA 검사
npm test               # build + qa
FIXTURES=1 npm run build && FIXTURES=1 npm run qa   # 샘플 데이터로 팝업·소식·상세·후기 레이아웃 확인 (배포 금지)
```

환경변수는 `.env.example` 참고 (`SITE_URL`, `FORM_ENDPOINT`, `GTM_ID`).

## 디자인 방향 (editorial refinement + 시안 B)

오프화이트 바탕, 기존 딥 틸 주색과 버건디 포인트를 유지합니다. 홈은 사진이 있을 때 꽉 찬 사진 히어로로 전환되고, 데스크톱에는 우측 퀵메뉴(상담·인스타·맨 위로), 소개·스튜디오에는 CMS의 '공간·위생 사진'으로 채워지는 콜라주 섹션이 있습니다. 비대칭 첫 화면, 왼쪽 정렬 타이포그래피, 서로 다른 색의 스튜디오·아카데미 카드로 콘텐츠의 위계를 구성합니다. 모바일에서 언어 선택은 항상 표시하고, 데스크톱 상담 버튼은 현재 페이지에 맞는 시술/수강 문의로 연결합니다.

웹폰트는 기존 Google Fonts 구성을 유지합니다. 히어로 이미지는 `public/images/{home,studio,academy}/hero.jpg`에 파일을 두거나 CMS로 업로드하면 사진을 사용하고(파일 존재 여부로 자동 판정, 목록은 `content/assets.js`), 사진이 없으면 장식용 LK 브랜드 그래픽을 표시합니다. 실제 결과·공간·고객 사진은 생성하지 않습니다. 변경 근거와 출시 준비 항목은 `docs/DESIGN_REVIEW.md`를 참고하세요.

CMS 사용·설정은 `docs/CMS.md`, 참고 사이트 요구사항 정의서와의 매핑은 `docs/ARCHITECTURE.md` 에 있습니다. 결정 사항: 전자상거래 제외, 해외 마스터클래스는 추후 구현(모델 필드만 준비).

## 운영 정보 채우기

1. `docs/MISSING_INFO.md` 의 목록을 확인
2. `/admin/` (Decap CMS) 또는 `content/data/*.json` 에서 값을 넣고 '운영자 확인 완료(verified)' 를 켬
3. 이미지는 CMS 업로드 또는 `public/images/...` 에 직접 추가 (파일이 있으면 빌드가 자동 사용)
4. `npm test` 로 검증 후 배포 (`docs/DEPLOY.md`)
