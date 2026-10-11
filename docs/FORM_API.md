# 폼 / API 설정 안내

사이트는 정적(HTML) 이므로 접수는 외부 엔드포인트가 받습니다. `.env` 의 `FORM_ENDPOINT` 에 URL 을 넣고 다시 빌드하면 세 언어의 두 폼(스튜디오·아카데미)이 해당 주소로 JSON POST 합니다.
엔드포인트가 비어 있으면 폼은 "온라인 접수 준비 중" 안내를 표시하고 **가짜 성공 화면을 만들지 않습니다.**

## 요청

`POST {FORM_ENDPOINT}` · `Content-Type: application/json`

```json
{
  "business_unit": "studio",            // studio | academy | event
  "event_id": "…",                      // event 일 때 (posts.js 의 id)
  "page_language": "en",                // 표시 언어
  "preferred_language": "en",           // 희망 상담 언어 (표시 언어와 별개)
  "lead_key": "uuid",                   // 중복 방지 키
  "name": "…", "contact": "…",
  "service_interest": "brow-hairstroke",// studio
  "has_previous": "no", "visit_date": "undecided",
  "experience_level": "beginner",       // academy
  "course_interest": "beginner-full", "start_timing": "1-3m",
  "message": "…",
  "consent_required": true, "consent_marketing": false,
  "campaign_id": "…", "utm_source": "…", "utm_medium": "…", "utm_campaign": "…", "utm_content": "…", "utm_term": "…",
  "first_utm_source": "…", "first_utm_medium": "…", "first_utm_campaign": "…",
  "referrer": "…", "landing_path": "/en/studio/",
  "submitted_at": "ISO8601"
}
```

허니팟 필드 `website` 는 클라이언트에서 제거하고 보내지 않습니다(봇은 채워서 보냄 → 서버에서 거부).

## 응답 규약 (클라이언트가 의존)

| 상태 | 의미 | 클라이언트 동작 |
|---|---|---|
| `200` `{ "ok": true, "lead_id": "…" }` | 저장 성공 | `lead_submit` 이벤트 → `/{lang}/contact/thanks/?unit=…` 이동 |
| `409` | `lead_key` 중복 | "이미 접수됨" 안내, 전환 없음 |
| `400` | 검증 실패 | "접수 실패" 안내 |
| 기타 / 네트워크 오류 | | "접수 실패" 안내, 버튼 재활성화 |

CORS: 사이트 도메인에서의 `POST` + `Content-Type` 헤더를 허용해야 합니다.

## 구현 선택지

1. **자체 서버리스 함수** — `api/lead.example.js` 를 Vercel/Netlify/Cloudflare Workers 등에 맞게 이식. 저장 어댑터(`saveLead`)에 DB·스프레드시트·CRM·알림을 연결.
2. **폼 SaaS** (Formspree 등) — JSON 수신·CORS·409 응답을 지원하는지 확인. 409 가 없으면 중복은 서버 측에서 별도 처리.
3. **CRM 직접 연동** — 필드 매핑 시 `business_unit`, `page_language`, `preferred_language`, `campaign_id` 를 분리 저장.

## 서버 측 필수 처리

- 검증(필수 필드·길이·허용값), 허니팟, 속도 제한
- `lead_key` unique 로 중복 방지 (DB unique index 권장)
- `business_unit=event` 는 `event_id` 별로 집계해 정원 관리에 활용 (잔여석은 운영자가 `content/posts.js` 의 `seatsLeft` 에 반영)
- 상태 관리: `new → contacted → consulted → booked/enrolled → visited/paid`, 별도 사유: 연락불가·부적합·중복·취소
- 담당자, 접수시각, 첫 응답시각을 사업별로 기록
- 개인정보는 보관 기간 정책에 따라 파기 (`docs/MISSING_INFO.md` 우선순위 3)

## 로컬 테스트

```bash
node api/lead.example.js            # :8787
FORM_ENDPOINT=http://localhost:8787/lead npm run build
npm run dev                          # :4173
```
