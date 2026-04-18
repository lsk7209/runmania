# Status | 마지막: 2026-04-18

## 현재 작업
없음 (배포 완료)

## 최근 변경 (최근 5개)
- 04-18: 유틸리티 5개 신규 + 사이트맵 등록
- 04-18: 블로그 20개 직접 작성 + DB 스케줄 등록 (D+0~D+19)
- 04-18: 리뷰 8개 한국어 추가 (총 29개)
- 04-18: GA4 (G-01M1XY4FM1) 추가
- 04-18: cron.yml URL 오타 수정 (runmaina→runmania)

## TODO
- [ ] Gemini API 키 갱신 (aistudio.google.com → Vercel 환경변수 교체)
- [ ] 사이트맵/RSS DB 연동 (현재 Blog.tsx 정규식 파싱 → 실제 포스트 미포함)
- [ ] Blog 조회수(views) 연동 (api/views.ts 있지만 Blog.tsx에서 미호출)
- [ ] robots.txt AI 봇 허용 추가 (GPTBot, ClaudeBot, PerplexityBot)
- [ ] llms.txt 생성 (GEO 최적화)

## 결정사항
- 콘텐츠 생성: Claude Code가 직접 작성 (Gemini API 키 만료 우회)
- 스케줄 발행: DB scheduled_at + cron.ts FIFO 방식

## 주의
- TURSO_DATABASE_URL의 DB명이 runmaina (오타지만 실제 DB명)
- .env.local에 Vercel 환경변수 저장됨 (.gitignore에 포함)
- cron.yml의 CRON_SECRET은 GitHub Secrets에 등록 필요
