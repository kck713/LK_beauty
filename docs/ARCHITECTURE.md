# 요구사항 정의서(참고 사이트 기준) ↔ LK 사이트 적용 현황

참고 사이트(Hương Trà Beauty & Academy)의 프론트엔드 구성·사이트맵·기능 아키텍처를 LK BEAUTY AXIS 기획안 v0.4에 맞춰 매핑한 결과입니다.
기준: 기획안이 금지하는 항목(미검증 후기·가격·과정, 해외 교육 모집, 가짜 목적지)은 구조만 준비하고 노출하지 않습니다.

## 1. UI/UX 화면 구성

| 요구 | 적용 | 구현 위치 |
|---|---|---|
| GNB: 좌 햄버거 · 중앙 로고 · 우 아이콘 | **적용** (우측은 장바구니 대신 상담 아이콘. 쇼핑 기능 결정 시 교체 가능) | `src/templates/layout.js`, `.header-inner` |
| 진입 팝업: 행사 이미지 + 성명·연락처 폼 + CTA | **적용, 기본 꺼짐(2026-10-12 운영자 결정)** — `content/posts/*.json`의 게시물에 `modal.enabled:true`와 기간을 설정하면 노출. 세션당 1회, '오늘 하루 보지 않기', Esc·포커스 트랩, 상담/개인정보/접수완료 페이지 제외 | `src/templates/extras.js` `modal()`, `src/scripts/main.js` |
| 팝업 폼 데이터 전송 | **적용** — 상담 폼과 같은 엔드포인트로 `business_unit:"event"`, `event_id` 포함 전송. 서버 성공 후에만 `lead_submit` | `docs/FORM_API.md` |
| 메인 Hero & About | **적용** — 홈 히어로(이미지 슬롯 포함) + '유행보다 기준' 소개. "상위 10대" 같은 검증 불가 수치는 사용하지 않음 | `content/i18n/*.js` `home` |

## 2. 사이트맵 / 정보 아키텍처

| 참고 사이트 | LK 대응 | 상태 |
|---|---|---|
| Trang chủ (홈) | `/{lang}/` | 적용 |
| Giới thiệu (브랜드 소개·강사진·리뷰) | `/{lang}/about/` + 강사(`academy.instructors`) + 후기 모듈(`content/testimonials/*.json`) | 적용. 강사·후기는 검증·동의 후 노출 |
| Dịch vụ (시술별 상세) | `/{lang}/studio/` + 시술 상세 `/{lang}/studio/{slug}/` | 적용. `services[].detail` 3개 언어 모두 채워지고 `verified` 일 때 자동 생성. 언어별 slug 지원, hreflang 자동 |
| Đào tạo (글로벌 마스터클래스·1:1 프리미엄) | `/{lang}/academy/` + 과정 상세 `/{lang}/academy/{slug}/` | 과정 상세 적용. **해외 마스터클래스는 기획안 범위 밖(한국인 대상 아카데미)** → 미적용. 필요 시 `posts` 의 event 타입으로 국내 세미나만 운영 |
| Sản phẩm (제품 구매·장바구니) | 없음 | **결정 필요** (아래 3-B) |
| Tin tức (뷰티 지식·이벤트·프로모션) | `/{lang}/news/` + 게시물 `/{lang}/news/{slug}/` (type: news/event/promotion) | 적용. 언어별 부분 게시 허용(한국어 전용 교육 소식 등), 있는 언어끼리만 hreflang |
| Liên hệ (지도·연락처) | `/{lang}/contact/` + 지도 임베드(`site.address.mapEmbedUrl`, 주소 verified 시) | 적용 |

## 3. 핵심 기능 / 백엔드

### A. 리드 캡처 · DB 연동 — 적용
- 폼 4종(스튜디오·아카데미·이벤트 신청·팝업 미니 폼)이 모두 같은 규약으로 `FORM_ENDPOINT` 에 JSON POST.
- 구분 키: `business_unit` (studio / academy / event), `event_id`, `page_language`, `preferred_language`, `campaign_id`, UTM first/last.
- 중복 방지 `lead_key`, 허니팟, 409 처리, 서버 성공 후 전환. 참고 핸들러 `api/lead.example.js`.
- CRM 상태 흐름과 유효 문의 정의는 `docs/FORM_API.md`, `docs/EVENTS.md`.

### B. 전자상거래 모듈 (장바구니·PG) — **제외 확정 (2026-10-11)**
- 운영자 결정: 전자상거래를 붙이지 않습니다. 헤더 우측은 상담 아이콘을 유지하고, 장바구니·제품 페이지·결제는 구현하지 않습니다.
- 추후 필요해지면 외부 커머스 링크(스마트스토어 등)를 메뉴 항목으로 추가하는 방식이 가장 가볍습니다. 사이트 구조 변경은 필요 없습니다.

### C. CMS (후기·포트폴리오·언론 보도 백오피스) — **Decap CMS 적용 (2026-10-11)**
- `/admin/` 에서 Git 기반 CMS(Decap)로 운영 정보·시술·과정·사례·소식·후기를 편집합니다. 저장 → GitHub 커밋/PR → 빌드·배포. 설정은 `public/admin/config.yml`, 안내는 `docs/CMS.md`.
- 운영 데이터는 JSON(`content/data/*.json`, `content/posts/*.json`, `content/testimonials/*.json`)이 단일 소스이며, 문구(i18n)·빌드 설정은 개발자 영역(JS)으로 분리했습니다.
- `verified`/`consent` 플래그가 CMS 필드('운영자 확인 완료', '사용 동의')로 노출되고, 검토 워크플로우(PR)와 빌드 단계 유효성 검사가 미검증 게시를 2중으로 막습니다.

### D. 글로벌 스케줄링 (마스터클래스 일정·TO·신청) — 국내 이벤트 범위로 적용, **해외 마스터클래스는 추후 구현 (2026-10-11 결정)**
- `posts.js` event 타입: 일시(KST)·장소·정원·잔여석·접수 여부. 상세 페이지에 참가 신청 폼, 목록·팝업 연동.
- 잔여석(`seatsLeft`)은 운영자 확정값을 수동 기재합니다. 실시간 좌석 차감·대기자·결제는 백엔드가 필요하며, 리드 엔드포인트에서 `event_id` 별 카운트로 시작할 수 있습니다.
- 해외 마스터클래스를 위한 준비: `event.country`(ISO 국가코드)와 `event.teachingLanguages` 필드를 모델에 미리 두었습니다. 현재는 표시에 사용하지 않습니다.
  추후 구현 시 할 일: ① 국가별 일정 목록 뷰(국가 필터) ② 현지 시간 병기(지금은 KST 고정) ③ 개최 언어·통역 여부 표시 ④ 신청 폼에 거주국 필드 ⑤ 해외 결제·예약금 정책 확인 ⑥ 기획안의 '해외 교육 모집 금지' 원칙을 운영자 확인 후 개정.

## 4. 개발·검증 방법

```bash
FIXTURES=1 npm run build && FIXTURES=1 npm run qa   # 샘플 데이터로 새 모듈 레이아웃 확인 (배포 금지, QA가 차단)
npm run build:preview                                # 실제 content 의 미확정 항목을 배지와 함께 확인
npm test                                             # 공개 빌드 + QA
```
