# 이벤트 명세 (GA4 / GTM dataLayer)

모든 이벤트는 `window.dataLayer.push({...})` 로 기록됩니다. `GTM_ID` 설정 시 GTM 이 수집하고, 미설정 시 dataLayer 에만 남습니다.
**이름·연락처·메시지·희망 일정 등 개인정보는 어떤 이벤트에도 넣지 않습니다.** (`scripts/qa.js` 가 정적 검사)

## 공통 파라미터 (모든 이벤트 자동 첨부)

| 키 | 값 | 설명 |
|---|---|---|
| `page_language` | `ko` / `en` / `ja` | 페이지 표시 언어. 국적을 뜻하지 않음 |
| `page_type` | `home` / `studio` / `academy` / `about` / `contact` / `privacy` / `thanks` / `404` | |
| `business_unit` | `brand` / `studio` / `academy` | 상담 탭 전환 시 contact 페이지에서 갱신 |
| `campaign_id` | 문자열 | URL `campaign_id` 또는 `utm_campaign` (last-touch) |

## 클라이언트 이벤트 (사이트에서 발생)

| 이벤트 | 발생 시점 | 추가 파라미터 | 의미 |
|---|---|---|---|
| `cta_click` | `data-cta` 가 붙은 상담 버튼 클릭 | `cta_location` (hero-primary / hero-secondary / band / mobile-sticky / home-choice / home-location), `business_unit` | 관심 행동 |
| `contact_click` | 인스타·카카오·전화·메일 등 외부 연결 클릭 | `contact_channel` | 외부 이동. **문의 완료 아님** |
| `form_start` | 폼 첫 입력 | `business_unit` | 접수 시작 |
| `lead_submit` | **서버 2xx 응답 이후에만** | `business_unit`, `service_id` (관심 시술 또는 과정 코드), `preferred_language`, `lead_id` | 접수 완료. 클릭 시 발생 금지 |
| `lead_submit_error` | 서버 오류·중복(409)·네트워크 실패 | `error_type` | 접수 실패 |

접수 완료 페이지(`/{lang}/contact/thanks/`)는 이벤트를 발생시키지 않으며 `noindex` 입니다. 전환은 `lead_submit` 으로만 집계합니다.

## 서버/CRM 이벤트 (담당자가 상담 기록에서 확정)

| 이벤트 | 의미 | 연결 키 |
|---|---|---|
| `qualified_lead` | 연락 가능·중복/스팸 제외·목적 일치 판정 | `lead_id` |
| `consultation_completed` | 상담 완료 | `lead_id` |
| `booking_confirmed` | 스튜디오 예약 확정 | `lead_id` |
| `studio_purchase` | 실제 방문·결제 | `lead_id` |
| `academy_enrollment` | 등록·결제 확인 | `lead_id` |

사업별(`business_unit`)·언어별(`page_language`)·캠페인별(`campaign_id`)로 검색 노출 → 클릭 → 접수 → 유효 → 예약/등록 → 방문/결제를 추적합니다. 광고 타깃 국가·분석 도구 추정 국가·고객 제공 거주국은 혼동하지 않습니다.

## UTM 보존 규칙

- 첫 방문의 UTM → `localStorage` (`lk_utm_first`) → 폼 `first_utm_*`
- 최근 UTM → `sessionStorage` (`lk_utm_last`) → 폼 `utm_*`, `campaign_id`
- 세션 첫 페이지와 referrer → 폼 `landing_path`, `referrer`
- `lead_key` (UUID) 는 폼 로드 시 1회 생성 → 서버 중복 방지(409)

## GTM 설정 메모

- GA4 이벤트 태그: 트리거 `Custom Event` = 위 이벤트명, 파라미터는 dataLayer 변수로 매핑
- 전환은 `lead_submit` 만 등록. `cta_click` / `contact_click` 은 전환으로 등록하지 않음
- 광고 플랫폼 전환 태그도 `lead_submit` 트리거에만 연결
- 동의(쿠키) 요건은 구현 시점의 각 플랫폼 공식 문서로 확인
