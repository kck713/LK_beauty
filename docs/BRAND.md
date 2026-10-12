# 브랜드 가이드라인 적용 메모 (LK BeautyAxis Brand Guidelines 2026)

출처: `LK_BeautyAxis_Guidelines` PDF (운영자 제공, 2026-10-12). 아래는 웹에 적용한 규칙과 남은 항목입니다.

## 컬러 (§03)
| 토큰 | 값 | 가이드 |
|---|---|---|
| `--primary` | `#0062ff` | Axis Blue |
| `--bg-alt` | `#f5f6f8` | Axis Grey 1 |
| `--line` | `#e2e4e7` | Axis Grey 2 |
| `--line-strong` | `#c9cacc` | Axis Grey 3 |
| `--ink-muted` | `#a8a8a8` | Axis Grey 4 |
| `--ink-soft` | `#6a6a6a` | Axis Grey 5 |
| `--ink` | `#0e0f11` | Black |

주요 컬러는 강조·구분에만 선택적으로 사용합니다. 팔레트 외 색은 쓰지 않으며, 버튼 hover 는 Black 으로 처리합니다.

## 로고 (§02)
- `public/images/brand/` 에 가이드 PDF에서 추출한 원본: `logo-primary-{blue,white,black}.png`(1600×291), `logo-lkba-*`, `logo-stacked-*`, `axis-mark-*`. 벡터(SVG/AI) 원본을 받으면 같은 파일명으로 교체하세요.
- 헤더·푸터는 Primary Logotype 블루 단색. 사진 패널 위에는 화이트 버전. 최소 폭 120px(헤더 24px 높이 ≈ 132px), 클리어스페이스는 심볼 높이의 2배.
- 금지: 비율·배열 변경, 두 가지 색 조합, 기울임·회전, 그림자·그라데이션·투명도, 지정 외 색상. (이전 버전의 텍스트 워드마크 "LK Beauty + 파란 Axis" 는 이 규칙에 어긋나 제거했습니다.)
- 파비콘: `public/favicon.png`, `apple-touch-icon.png` = 블루 바탕 + 화이트 Axis Mark.

## 타이포그래피 (§04)
- KR 브랜드 서체 Pretendard: jsDelivr 다이내믹 서브셋 CSS 로 로드. 불가 환경에서는 Noto Sans KR(Google Fonts) → 시스템 서체.
- EN 브랜드 서체 Neue Haas Grotesk: 상용 라이선스 서체라 저장소에 포함하지 않습니다. 라이선스 확보 후 `public/fonts/brand-fonts.css` 와 woff2 를 두면 빌드가 자동으로 연결합니다(`@font-face { font-family: "Neue Haas Grotesk Text" … }`, Display 도 동일). 없으면 Pretendard(라틴 글리프) → Arial.
- 위계: Title ExtraLight(200)·Light(300), Subtitle/Body Regular(400), 소제목 Medium(500). 자간 EN +0.02em, KR −0.01em.

## 그리드 (§05)
- 좌우 여백 = 짧은 변의 5% (`--gutter: clamp(20px, 5vmin, 64px)`), 최대 폭 1240px.
- 가는 1px 그리드 라인(Grey 2)을 섹션 구분과 카드 경계에 사용. 가치 섹션은 2×2 십자 그리드.

## 언어 (§01 Verbal Identity)
- 슬로건: Define your axis (푸터·사진 패널)
- 키 메시지: Balance is designed, not discovered / 균형은 우연의 발견이 아닌, 필연의 설계다 (홈 히어로) · Where balance begins
- 서포팅: Only what belongs · Aligned in quiet balance
- 브랜드 아이디어 The perceptive axis (홈 철학 섹션), 목적 Beyond beauty, towards life (소개 히어로), 가치 Insight·Axis·Balance·Continuum (소개 페이지 2×2)
- 톤: 불필요한 수식 배제, 감각적 표현보다 판단의 근거, 결과보다 기준과 과정.

## 확인 필요
- 가이드 문구 예시(명함)에 "서울시 강동구 천호대로 1120, 107호 / 07-1475-1136" 이 보입니다. 카카오 채널·인스타그램의 삼성동과 다르므로 실제 주소·전화는 운영자 확인 후 `content/data/site.json` 에 반영해 주세요. 현재 사이트는 삼성동(동 단위)만 표시합니다.
- 가이드의 "Hair volumizing care" 예시는 서비스 확정 자료가 아니므로 반영하지 않았습니다.
