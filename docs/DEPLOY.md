# 배포 안내

## 빌드

```bash
cp .env.example .env   # SITE_URL, FORM_ENDPOINT, GTM_ID 설정
set -a; . ./.env; set +a
npm run build          # → dist/
npm run qa             # 출시 QA 자동 검사
```

`dist/` 전체가 산출물입니다. 의존성 설치가 필요 없습니다(Node 18+).

## 호스팅 요구사항

- 디렉터리 경로 (`/ko/studio/`) → `index.html` 서빙, trailing slash 유지 (301 로 통일)
- 없는 경로 → **실제 404 응답** + `404.html` (언어별 `/{lang}/404.html` 도 제공)
- `/` 는 언어 선택 페이지. **IP·브라우저 언어 기반 서버 리디렉션 금지** (Google 지침)
- HTTPS 강제, `www`/non-www 한쪽으로 301 통일 후 `SITE_URL` 과 일치시킬 것

### 예시 설정

**Netlify** `_redirects` 는 필요 없음 (기본 동작으로 충분). 404 는 `dist/404.html` 자동 인식.

**Vercel** `vercel.json`:
```json
{ "trailingSlash": true, "cleanUrls": false }
```

**Cloudflare Pages**: 기본 설정으로 동작. 404 는 `404.html` 자동 인식.

**Nginx**:
```
location / { try_files $uri $uri/index.html =404; }
error_page 404 /404.html;
```

## 출시 전 체크

1. `.env` 의 `SITE_URL` 이 실제 도메인과 정확히 일치 (canonical/hreflang/sitemap 에 사용)
2. `FORM_ENDPOINT` 가 실서버이고 CORS 허용됨 → 세 언어에서 실제 접수 1건씩 테스트 후 삭제
3. Search Console 등록 → `sitemap.xml` 제출, 색인 상태·국가·쿼리별 성과 확인
4. `docs/MISSING_INFO.md` 의 우선순위 1 항목 확인 여부 점검
5. `PREVIEW` 환경변수가 공개 빌드 환경에 **설정되어 있지 않은지** 확인
6. 모바일 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 을 실험실 도구(Lighthouse)로 측정. 이미지 추가 시 WebP·크기 지정 유지
