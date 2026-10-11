# QA 기록

## 자동 검사 (`npm run qa`)

| 항목 | 검사 내용 |
|---|---|
| 메타 | title, description, H1 1개, `html lang` = 경로 언어 |
| canonical | 각 언어 페이지가 자체 URL 을 canonical 로 가짐 (영문 홈으로 몰지 않음) |
| hreflang | ko/en/ja/x-default 4개, self-reference, 양방향, 대상 페이지 존재. 스튜디오↔스튜디오, 아카데미↔아카데미만 연결 |
| 링크 | 모든 내부 href/src/action 이 실제 파일로 해석됨, http 링크 금지 |
| 문구 | `{…}` 미치환 잔존, `undefined`, `[object Object]` 없음 |
| 미확정 | 공개 빌드에서 '미확정' 배지 노출 없음 |
| 폼 | 두 폼 존재, `business_unit`/`page_language`/`preferred_language`/`campaign_id`/`lead_key`/`consent_required` 필드, 오류 문구 주입 |
| 색인 | thanks 페이지 noindex 및 sitemap 제외, sitemap loc 전부 존재, robots.txt, 404.html |
| 개인정보 | `lead_submit` 이벤트에 name/contact/message/visit_date 없음 |
| i18n | 빌드 시 세 언어 키 구조 일치·빈 문자열 금지 |

## 브라우저 검사 (Playwright, 2026-10-11 실행) — 전부 PASS

- 360/390/430 px 및 1280 px 에서 가로 스크롤 없음 (루트, 홈, 스튜디오, 아카데미, 상담, 소개)
- 언어 전환이 같은 페이지의 대응 언어 URL 로 이동 (`/ko/academy/` → `/en/academy/`, `/ja/academy/`)
- 상담 페이지에는 고정 CTA 없음(입력창 가림 방지); 스튜디오/아카데미 고정 CTA 는 `/contact/#studio|#academy` 로 연결
- URL 해시로 상담 탭 선택 (`#academy`)
- 폼 검증: 빈 제출 시 오류 6개 표시, 첫 오류 필드로 포커스, 서버 성공 전 `lead_submit` 없음
- `form_start` 첫 입력 시 1회, UTM 이 hidden 필드에 보존
- 서버 200 → `lead_submit` (PII 없음) → `/{lang}/contact/thanks/?unit=…` 이동, 사업별 완료 문구
- 서버 409 → 중복 안내, 전환 없음, 버튼 재활성화, 페이지 유지
- 첫 Tab 키로 '본문으로 건너뛰기' 링크 포커스
- 루트 `/` 에서 ja 브라우저에 일본어 링크 **추천만** 표시, 자동 이동 없음
- 개발 서버: 없는 경로 404 응답, trailing slash 없는 경로 301

## 수동 확인 필요 (출시 전)

- [ ] 실제 `FORM_ENDPOINT` 로 세 언어 × 두 폼 접수 테스트 및 CRM 저장 확인
- [ ] 실제 도메인에서 canonical/hreflang/sitemap 검증 (Search Console)
- [ ] 일본어 원어민 검수, 영어 최종 검수
- [ ] 이미지 추가 후 용량·WebP·LCP 측정
- [ ] 스크린리더(VoiceOver/TalkBack)로 폼 라벨·오류 안내 읽기 확인
- [ ] `PREVIEW` 미설정 상태의 공개 빌드에서 미확정 문구 노출 여부 최종 확인
