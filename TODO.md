# RunMania 프로젝트 완성 태스크 목록

> 코드 검토 기준일: 2026-03-15
> 전체 완성도: ~97% (핵심 기능 모두 동작, 아래 항목은 품질/운영 관련)

---

## HIGH (필수 완성 항목)

### 1. Blog 상세 페이지 조회수(blog_views) 연동 누락

- **현황**: `api/views.ts`에 GET/POST 핸들러와 `blog_views` 테이블(schema.sql)이 존재하지만, `src/pages/Blog.tsx`의 BlogDetail 컴포넌트에서 `/api/views` 를 전혀 호출하지 않음. 조회수 증가도, 표시도 없음.
- **해결 방법**:
  1. BlogDetail 마운트 시 `POST /api/views?slug=...` 호출하여 조회수 증가
  2. 반환된 count를 UI에 표시 (예: 날짜/읽기시간 옆에 "조회 N회")
  3. 중복 카운트 방지를 위해 sessionStorage 기반 debounce 추가 권장
- **예상 규모**: Small

### 2. SEO 빌드 플러그인의 DB 미연동 (sitemap/RSS가 정적 파싱)

- **현황**: `vite.config.ts`의 sitemapPlugin과 rssPlugin이 `Blog.tsx` 소스코드를 정규식으로 파싱하여 slug/title/date를 추출함. DB에서 동적으로 생성된 포스트는 sitemap.xml과 rss.xml에 포함되지 않음.
- **해결 방법**:
  1. 빌드 시 또는 별도 스크립트로 DB(Turso)에서 published 포스트 목록을 조회
  2. sitemap.xml과 rss.xml 생성 로직을 DB 데이터 기반으로 변경
  3. 대안: cron이나 post-publish hook에서 sitemap/rss를 재생성하는 API 엔드포인트 추가
- **예상 규모**: Medium

---

## MED (품질 향상 항목)

### 4. 관리자 인증 강화

- **현황**: `ADMIN_PASSWORD` 환경변수 단일 비밀번호 방식. rate limiting 없음. debug-env 엔드포인트는 body에서만 password를 받도록 보호됨(query string 거부 테스트 있음).
- **해결 방법**:
  1. 로그인 시도 rate limiting 추가 (IP 기반 또는 토큰 버킷)
  2. 세션 토큰 기반 인증으로 전환 (JWT 또는 서버사이드 세션)
  3. 프로덕션 배포 시 시크릿 관리 서비스(Vercel env, Vault 등) 사용 확인
- **예상 규모**: Medium

### 5. Gemini API 실패 시 사용자 피드백 개선

- **현황**: 단건 생성 실패 시 Admin.tsx에서 toast로 에러를 표시하고, bulk pipeline은 결과 객체에 error 필드를 포함하여 반환함. 기본적인 에러 핸들링은 동작하나, 에러 유형별 안내(API 키 미설정, 할당량 초과, 네트워크 오류 등)가 없음.
- **해결 방법**:
  1. `admin-generate.ts`에서 Gemini 에러 유형을 분류하여 구체적 메시지 반환
  2. Admin UI에서 에러 유형별 다른 안내 (재시도 버튼, API 키 확인 안내 등) 표시
  3. SEO brief 생성 실패 시 fallback brief 사용 중임을 사용자에게 명시
- **예상 규모**: Small

### 6. 콘텐츠 품질 게이트 자동발행 차단 검증

- **현황**: `seoPipeline.ts`의 `buildQualityGate()`는 blocker가 있으면 `passed: false`를 반환함. bulk pipeline에서 품질 게이트 통과 시 auto-approve하는 로직이 있으나, 단건 생성 후 수동 발행 경로에서 품질 게이트 미통과 시 발행을 강제 차단하는지 불명확.
- **해결 방법**:
  1. publish 액션에서 `quality_gate.passed === false`인 경우 경고 또는 차단 로직 추가
  2. Admin UI에서 품질 게이트 미통과 포스트에 시각적 경고 표시
  3. 강제 발행 옵션(override) 제공 시 확인 다이얼로그 추가
- **예상 규모**: Small

### 7. E2E 테스트 및 커버리지 확대

- **현황**: `src/test/adminWorkflow.test.ts`에 13개의 포괄적인 단위 테스트 존재 (워크플로우 가드, 벌크 파이프라인, cron 보안, 생성 검증 등). 그러나 프론트엔드 컴포넌트 테스트, Blog/Review 페이지 E2E 테스트는 없음.
- **해결 방법**:
  1. 프론트엔드 주요 페이지 렌더링 테스트 추가 (Blog, Review, Diagnosis)
  2. SEO 파이프라인 단위 테스트 추가 (buildQualityGate, buildSchemaJson)
  3. 커버리지 리포트 설정 (vitest --coverage)
- **예상 규모**: Large

---

## LOW (나이스 투 해브)

### 8. IndexNow 키 하드코딩 제거

- **현황**: `vite.config.ts`의 `indexNowPlugin()`에 IndexNow API 키가 하드코딩되어 있음 (`b1c3e5a7d9f2e4b6a8c0d2e4f6a8b0c1`).
- **해결 방법**: 환경변수(`INDEXNOW_KEY`)로 분리
- **예상 규모**: Small

### 9. RSS/Sitemap 빌드 결과 검증 자동화

- **현황**: 빌드 플러그인이 생성한 sitemap.xml, rss.xml의 유효성을 자동으로 검증하지 않음. 생성 실패 시 console.warn만 출력.
- **해결 방법**:
  1. 빌드 후 생성된 XML 파일 기본 유효성 검사 (well-formed XML, 필수 필드 존재)
  2. CI 파이프라인에 검증 스텝 추가
- **예상 규모**: Small

### 10. Blog 카테고리 매핑 동적화

- **현황**: `Blog.tsx`의 `POST_CATEGORY` 매핑이 하드코딩되어 있음 (20개 slug). DB에서 동적 생성되는 포스트는 카테고리 필터에 "전체"로만 표시됨.
- **해결 방법**: 포스트의 tags 또는 content_type 기반으로 카테고리를 자동 분류하거나, DB에 category 필드 추가
- **예상 규모**: Medium

---

## DONE (완료 확인된 항목)

### scheduled_at UI 입력
- Admin.tsx에 `datetime-local` 입력 필드, 유효성 검증(승인 필수, 시간 필수), 저장 로직 모두 구현 완료 (라인 1026-1035)

### 워크플로우 가드
- 미승인 발행 차단, 발행 후 워크플로우 변경 차단, 동시 생성 차단, 발행 포스트 재생성 차단 등 13개 테스트 통과

### SEO 파이프라인
- Gemini 기반 SEO brief 생성, fallback brief, 품질 게이트 (8개 체크 항목), Schema JSON 생성 모두 구현

### Bulk Pipeline
- 대량 생성 + 자동 스케줄링 + 자동 승인 워크플로우 완성, 실패 시 draft 유지 및 에러 보고

### Cron 보안
- CRON_SECRET 미설정 시 500, 잘못된 토큰 시 401 반환. 스케줄 포스트 우선 발행 로직 동작

### Supabase 잔재 정리
- `supabase/` 디렉토리, `.env` Supabase 키, 문서 내 참조 모두 제거 완료 (2026-03-15)
