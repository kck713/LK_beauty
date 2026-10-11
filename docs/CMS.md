# CMS 안내 — Decap CMS (Git 기반)

운영자가 `https://<도메인>/admin/` 에서 폼으로 콘텐츠를 편집하면 GitHub 저장소의 JSON 파일이 커밋됩니다. 별도 DB·서버 없이 Git 이 단일 소스이고, 커밋이 빌드·배포를 트리거합니다.

## 무엇을 편집할 수 있나

| 메뉴 | 파일 | 내용 |
|---|---|---|
| 사이트 운영 정보 | `content/data/site.json` | 주소·운영시간·문의 채널·상담 지원 언어·개인정보 안내 |
| 스튜디오 | `content/data/studio.json` | 시술 메뉴·가격·리터치 조건·시술 상세·실제 사례 |
| 아카데미 | `content/data/academy.json` | 과정·커리큘럼·교정 영상·성장 사례·강사·수료 후 지원 |
| 소식·이벤트·프로모션 | `content/posts/{id}.json` | 게시물, 이벤트 정원·신청, 진입 팝업 on/off |
| 고객·수강생 후기 | `content/testimonials/{id}.json` | 후기, 동의·대가 여부 |

UI 문구(메뉴·버튼·안내문)는 `content/i18n/*.js` 로 개발자가 관리합니다. 세 언어 키 구조가 같아야 빌드되므로 CMS 에 노출하지 않았습니다.

## 공개 규칙 (미검증 콘텐츠 차단)

1. 각 항목의 **운영자 확인 완료(verified)** 가 꺼져 있으면 공개 사이트에 나오지 않습니다. 사례·후기는 **사용 동의(consent)** 도 켜져야 합니다.
2. **검토 워크플로우**(`publish_mode: editorial_workflow`): 저장하면 바로 반영되지 않고 '초안 → 검토 중 → 게시 준비' 단계를 거쳐 '게시'를 눌러야 머지됩니다. GitHub 에서는 PR 로 보입니다.
3. **빌드 유효성 검사**: 잘못된 ID·slug, 동의 없는 공개 사례, 팝업 중복 활성화 등은 빌드가 실패하며 배포되지 않습니다 (`src/build.js` `validateContent`).
4. 이미지는 결과를 바꾸는 보정 없이 원본을 올리고, 촬영 시점(직후/탈각 후/리터치 후)을 선택합니다.

## 설정 (개발자, 출시 전 1회)

`public/admin/config.yml`:

- `backend.repo`: `kck713/LK_beauty` (확인), `backend.branch`: 운영 브랜치(예: `main`)
- `backend.base_url`: GitHub OAuth 중계 서버 주소. Decap 의 GitHub 백엔드는 로그인용 OAuth 앱이 필요합니다. 선택지:
  1. **Netlify 호스팅**: `backend.name: git-gateway` 로 바꾸고 Netlify Identity + Git Gateway 를 켜면 `base_url` 불필요. 운영자 초대는 Netlify Identity 에서.
  2. **Vercel/Cloudflare/기타 호스팅**: GitHub OAuth App 을 만들고 중계 서버를 하나 띄웁니다 (예: `decap-oauth` 류의 Cloudflare Worker, 또는 Vercel 서버리스 함수). 그 주소를 `base_url` 에 넣습니다. 저장소 쓰기 권한이 있는 GitHub 계정만 로그인할 수 있습니다.
- `site_url` / `display_url`: 실제 도메인
- 이미지 업로드 경로: 기본 `public/images/uploads` (컬렉션별로 `images/cases`, `images/academy`, `images/posts`, `images/about` 지정됨). 저장되는 값은 `images/...` 형태이며 빌드가 자동으로 사용합니다.

GitHub 저장소 설정: 운영 브랜치 보호 규칙에서 PR 머지를 허용하고, CI 에 `npm test` 를 두면 유효성 검사 실패 시 머지가 막힙니다.

## 로컬에서 CMS 써 보기 (개발자)

```bash
npm run build && npm run dev          # http://localhost:4173
npx decap-server                      # 별도 터미널, 포트 8081 (config 의 local_backend: true)
# 브라우저에서 http://localhost:4173/admin/ → 로그인 없이 로컬 파일을 편집. 저장하면 content/ 파일이 바뀜.
```
편집 후 `npm test` 로 빌드·QA 확인 후 커밋합니다. 운영 배포 전에는 `local_backend: true` 를 제거하거나 그대로 두어도 무방합니다(로컬 서버가 없으면 무시됨).

- 로컬 서버 첫 화면에서 **Login** 버튼을 한 번 눌러야 컬렉션이 보입니다(인증 없음).
- 기본(fs) 모드는 검토 워크플로우(초안/검토/게시)를 지원하지 않고 저장 즉시 파일을 바꿉니다. 워크플로우까지 로컬에서 보려면 `MODE=git npx decap-server` 로 실행하세요(로컬 브랜치 `cms/*` 가 생깁니다).
- 검증 기록(2026-10-11): 로컬 백엔드에서 5개 컬렉션·편집 화면(운영 정보 파일 컬렉션, 게시물 항목)이 정상 로드되는 것을 브라우저로 확인했습니다.

## 운영자 흐름 요약

1. `/admin/` 로그인 → 메뉴 선택 → 항목 편집 → '운영자 확인 완료' 켜기 → 저장
2. 검토자(또는 본인)가 워크플로우에서 '게시' → PR 머지 → 자동 빌드·배포
3. 새 이미지가 필요한 섹션(히어로·OG 등)은 `docs/MISSING_INFO.md` 의 경로에 업로드하면 다음 빌드에서 자동 반영
