# RunMania (런닝화매니아)

한국어 런닝화 추천 플랫폼. 사용자의 발 특성과 러닝 스타일을 7문항 진단으로 분석하여 최적의 런닝화를 추천합니다.

- 프로덕션 URL: https://runmania.kr
- 배포: Vercel (서버리스 Functions + 정적 SPA)

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | React 18 + TypeScript + Vite 5 |
| UI | shadcn/ui + Tailwind CSS + Framer Motion |
| 상태/데이터 | TanStack Query (서버 상태), React Hook Form + Zod (폼) |
| 라우팅 | React Router v6 |
| Backend | Vercel Serverless Functions (Node.js, `api/` 디렉토리) |
| Database | Turso (libsql/SQLite, 엣지 호환) |
| AI | Google Gemini 2.5-flash (콘텐츠 자동 생성) |
| SEO | 빌드 타임 sitemap.xml, rss.xml 자동 생성 + IndexNow 핑 |

---

## 디렉토리 구조

```
api/                        # Vercel 서버리스 함수 (각 파일이 하나의 엔드포인트)
  admin-blog.ts             # 블로그 CRUD — POST 요청, 패스워드 인증
  admin-generate.ts         # Gemini AI로 블로그 콘텐츠 자동 생성
  cron.ts                   # 예약 발행 핸들러 (CRON_SECRET Bearer 인증)
  db.ts                     # Turso DB 클라이언트 + 스키마 마이그레이션
  debug-env.ts              # 환경변수 진단 (관리자 전용)
  posts.ts                  # 공개 블로그 API (목록/단건 조회)
  seoPipeline.ts            # SEO 브리프 생성
  views.ts                  # 뷰 카운트 트래킹

src/
  components/               # UI 컴포넌트
    Header.tsx              # 사이트 네비게이션
    LandingPage.tsx         # 진단 인트로 화면 (CTA)
    QuestionFlow.tsx        # 7문항 진단 설문 UI
    ResultPage.tsx          # 진단 결과 + 신발 추천 카드
  data/
    shoesDb.ts              # 30+ 런닝화 데이터베이스 (스펙, bestFor/banFor 태그)
    reviewContent.ts        # 신발별 리뷰 텍스트 블록
    localBlogPosts.ts       # 블로그 로컬 폴백 데이터
    blogPostUtils.ts        # 블로그 타입 정의
  lib/
    diagnosisEngine.ts      # 핵심 진단 알고리즘 (스코어링 + 타입 분류)
  pages/
    Home.tsx                # 메인 랜딩 페이지
    Diagnosis.tsx           # 진단 흐름 오케스트레이터
    Blog.tsx                # 블로그 목록/상세
    Reviews.tsx             # 신발 리뷰 브라우저
    Admin.tsx               # 관리자 패널 (콘텐츠 관리, AI 생성)
    PaceCalculator.tsx      # 러닝 페이스 계산기
    SizeConverter.tsx       # 국제 사이즈 변환기
    Tools.tsx               # 도구 허브 페이지

vite.config.ts              # Vite 설정 + 커스텀 플러그인 4개
vercel.json                 # Vercel 라우팅/리다이렉트/보안 헤더
```

---

## 핵심 기능 흐름

### 1. 신발 진단 알고리즘 (`src/lib/diagnosisEngine.ts`)

```
사용자 입력 (7문항)
  ↓
buildProfile() — 답변을 UserProfile boolean 플래그로 변환
  ↓
scoreShoe() — 30+ 신발 각각에 점수 부여
  ├─ Ban 규칙: 부적합 조합 시 -100/-50 즉시 반환 (예: 넓은 발 + 좁은 라스트)
  ├─ bestFor 매칭: 태그별 가중치 합산 (+10~+30)
  └─ 기본 보너스: cushion/neutral 타입 +5
  ↓
결과 정렬 → 추천 1순위 + 대안 2개 + 금지 목록
  ↓
getTypeName() — 6개 러너 타입 분류 (TYPE A~F)
  TYPE A: 구름 위 산책러 (넓은 발 + 소프트 쿠션)
  TYPE B: 안정성 최우선러 (편평족/발목 통증)
  TYPE C: 관절 보호 러너 (과체중/무릎 통증)
  TYPE D: 스피드 체이서 (상급 러너)
  TYPE E: 와이드 컴포트러 (넓은 발)
  TYPE F: 밸런스 러너 (기본)
```

### 2. 블로그 콘텐츠 워크플로우

```
idea → (AI 생성 요청) → reviewing → approved → published
                                      ↓
                              scheduled_at 설정 시
                                      ↓
                              cron이 자동 발행
```

- **AI 생성**: `api/admin-generate.ts`에서 Gemini API로 제목/본문 자동 생성
- **스케줄 발행**: `api/cron.ts`가 `scheduled_at` 시점 도래한 게시물을 자동 published로 전환
- **뷰 트래킹**: `api/views.ts`가 slug 기준으로 조회수 집계

---

## 로컬 개발 환경 세팅

### 사전 요구사항
- Node.js 18+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local   # 또는 직접 .env.local 생성

# 개발 서버 (포트 8080)
npm run dev
```

### 환경변수 (.env.local)

| 변수 | 설명 |
|------|------|
| `TURSO_DATABASE_URL` | Turso 데이터베이스 URL (`libsql://` 또는 `https://`) |
| `TURSO_AUTH_TOKEN` | Turso 인증 토큰 |
| `GEMINI_API_KEY` | Google Gemini API 키 (AI 콘텐츠 생성용) |
| `ADMIN_PASSWORD` | 관리자 패널 인증 비밀번호 |
| `CRON_SECRET` | Cron 작업 Bearer 토큰 |

### 개발 서버 API 프록시

`vite.config.ts`의 `devApiPlugin`이 `/api/*` 요청을 Vercel 서버리스 함수와 동일하게 로컬에서 처리합니다. 별도의 백엔드 서버 실행이 필요 없습니다.

### 기타 스크립트

```bash
npm run build        # 프로덕션 빌드 (dist/ 생성 + sitemap/rss 자동 생성)
npm run preview      # 빌드 결과 미리보기
npm run lint         # ESLint 실행
npm run test         # Vitest 테스트 실행
npm run test:watch   # Vitest 감시 모드
```

---

## API 엔드포인트 레퍼런스

### 공개 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/posts` | 발행된 블로그 목록 |
| GET | `/api/posts?slug=X` | 슬러그로 블로그 단건 조회 |
| POST | `/api/views` | 뷰 카운트 증가 |

### 관리자 API (ADMIN_PASSWORD 인증 필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/admin-blog` | 블로그 CRUD (action 파라미터로 분기) |
| POST | `/api/admin-generate` | AI 콘텐츠 생성 요청 |
| POST | `/api/debug-env` | 환경변수 진단 |

### 시스템 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/cron` | 스케줄 발행 실행 (CRON_SECRET Bearer 인증) |

---

## 데이터베이스 스키마

Turso (libsql/SQLite) 사용. 스키마는 `api/db.ts`의 `ensureContentSchema()`에서 자동 마이그레이션됩니다.

### blog_posts

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | TEXT PK | 게시물 ID |
| title | TEXT | 제목 |
| slug | TEXT | URL 슬러그 |
| content | TEXT | 본문 (HTML/Markdown) |
| excerpt | TEXT | 요약 |
| status | TEXT | `draft` / `scheduled` / `published` |
| workflow_status | TEXT | `idea` / `reviewing` / `approved` |
| content_type | TEXT | 콘텐츠 유형 (기본: `blog`) |
| scheduled_at | TEXT | 예약 발행 시각 |
| generation_meta | TEXT | AI 생성 메타데이터 (JSON) |
| last_generated_at | TEXT | 마지막 AI 생성 시각 |
| generation_count | INTEGER | AI 생성 횟수 |
| generation_in_progress | INTEGER | AI 생성 진행 중 플래그 |
| generation_started_at | TEXT | AI 생성 시작 시각 |
| created_at | TEXT | 생성일 |
| updated_at | TEXT | 수정일 |

### blog_views

| 컬럼 | 타입 | 설명 |
|------|------|------|
| slug | TEXT PK | 게시물 슬러그 |
| count | INTEGER | 조회수 |

### app_settings

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 항상 1 (싱글톤) |
| publish_interval_hours | INTEGER | 자동 발행 간격 (시간, 기본 5) |
| auto_publish_enabled | INTEGER | 자동 발행 활성화 (0/1) |
| updated_at | TEXT | 수정일 |

### content_generation_logs

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | TEXT PK | 로그 ID |
| post_id | TEXT | 대상 게시물 ID |
| status | TEXT | 생성 상태 |
| requested_prompt | TEXT | 요청 프롬프트 (JSON) |
| generated_title | TEXT | 생성된 제목 |
| error_message | TEXT | 에러 메시지 |
| created_at | TEXT | 요청 시각 |
| completed_at | TEXT | 완료 시각 |

---

## 프론트엔드 라우트

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | Home | 메인 랜딩 |
| `/tools/diagnosis` | Diagnosis | 7문항 신발 진단 |
| `/blog` | Blog | 블로그 목록 |
| `/blog/:slug` | Blog | 블로그 상세 |
| `/reviews` | Reviews | 신발 리뷰 목록 |
| `/reviews/:slug` | Reviews | 신발 리뷰 상세 |
| `/tools` | Tools | 도구 허브 |
| `/tools/pace-calculator` | PaceCalculator | 페이스 계산기 |
| `/tools/size-converter` | SizeConverter | 사이즈 변환기 |
| `/admin` | Admin | 관리자 패널 |

> `/diagnosis` → `/tools/diagnosis` 301 리다이렉트가 `vercel.json`에 설정되어 있음

---

## 배포 (Vercel)

- `vercel.json`에 라우팅 규칙 정의: `/api/*`는 서버리스 함수, 나머지는 SPA 폴백 (`index.html`)
- 빌드 시 `sitemap.xml`, `rss.xml` 자동 생성 (vite 플러그인)
- 빌드 후 IndexNow + Google 핑 자동 전송
- 보안 헤더: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- 정적 에셋 `/assets/*`에 1년 캐시 (`immutable`)

---

## 주의사항 / 알려진 이슈

1. **DB 스키마 마이그레이션**: `api/db.ts`의 `ensureContentSchema()`가 서버리스 함수 콜드 스타트 시 `ALTER TABLE ADD COLUMN`을 실행. 이미 존재하는 컬럼이면 에러를 무시하는 방식 (정식 마이그레이션 도구 미사용).

2. **로컬 블로그 폴백**: DB 접속 실패 시 `src/data/localBlogPosts.ts`의 정적 데이터로 폴백.

3. **Vite devApiPlugin**: 로컬 개발 시 Vercel 서버리스 함수를 에뮬레이션하지만, Vercel 런타임과 100% 동일하지는 않음. `req.body`/`req.query` 어댑터 방식 차이에 유의.

4. **TypeScript 설정**: `strictNullChecks: false`, `noImplicitAny: false`로 느슨한 타입 체크 사용 중.

5. **경로 별칭**: `@/`는 `src/`에 매핑 (tsconfig.json + vite.config.ts 모두 설정됨).
