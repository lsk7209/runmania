# Status | 마지막: 2026-04-18

## 현재 작업
완료 (배포됨)

## 최근 변경 (최근 5개)
- 04-18: Quality Gate 단건 발행 차단 + Admin force override
- 04-18: SPA 프리렌더 (12개 핵심 라우트 정적 HTML 생성)
- 04-18: Blog 조회수 연동 + Gemini API 키 갱신
- 04-18: SEO/GEO 전면 최적화 (robots.txt, llms.txt, 동적 sitemap/rss, Reviews JSON-LD)
- 04-18: 블로그 20개 + 리뷰 29개 + 유틸리티 8개 콘텐츠 추가

## TODO
- [ ] Gemini AQ. 키 포맷 검증 (admin-generate.ts는 @google/generative-ai 사용 중 → AQ. 키 호환 확인 필요)
- [ ] 동적 OG 이미지 (/api/og?title=)
- [ ] SPA 완전 SSG 마이그레이션 (현재 핵심 라우트만 프리렌더)
- [ ] 네이버 서치어드바이저 RSS 재제출
- [ ] GSC 도메인 인증 (id-ai-179@cursorai-451704.iam.gserviceaccount.com 소유자 추가)

## 결정사항
- 콘텐츠: Claude Code 직접 작성 (API 키 의존 없음)
- 사이트맵/RSS: DB 기반 동적 API (api/sitemap.ts, api/rss.ts)
- 프리렌더: 빌드 후 scripts/prerender.ts 자동 실행

## 주의
- TURSO_DATABASE_URL DB명이 runmaina (오타지만 실제 DB명)
- Gemini AQ. 키가 admin-generate.ts와 호환되는지 확인 필요
- GitHub Actions CRON_SECRET 시크릿 설정 여부 확인 필요
