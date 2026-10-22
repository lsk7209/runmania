# Status | 마지막: 2026-10-22

## 현재 작업
애드센스 승인 준비 (브랜치 `claude/fervent-bohr-dqcf8c`). 내부 점수 68/100, 신청 전.
발행 글 635편 전수 감사 완료 → `docs/content-audit-2026-10.md`, `docs/content-audit-table.md`

## 최근 변경 (최근 5개만)
- 10-22: 템플릿 글 200편 noindex + sitemap·RSS·블로그 목록 제외 (`api/noindexPosts.ts`)
- 10-22: 발행 글 635편 전수 감사 (템플릿 200편 noindex→삭제, 표시 오류 34편, 중복 12쌍)
- 10-22: cron AI 초안 자동 승인 중단 + 24시간 발행 상한(기본 2)
- 10-22: 공용 Footer, Contact/Terms 한국어화, 리뷰 AggregateRating 제거, 404 noindex
- 10-22: prerender 영어 보일러플레이트 제거, 전역 canonical 제거

## TODO
- [ ] 배포 후 2~4주: GSC로 noindex 200편 클릭 확인 → 삭제(410) 또는 301
- [ ] 표시 오류 34편 수정, 템플릿 글로 가는 링크 33개 정리, 중복 12쌍 301
- [ ] 공개 `/api/posts?slug=` 내부 필드 노출 차단
- [ ] 고유 자료 계획, 운영자 프로필, 건강 글 47편 출처·감수 구조
- [ ] 예약 대기 글 확인 (DB 필요), 이미지 출처 확인
- [ ] AdSense 결제 보류/전화 PIN 확인은 계정 콘솔에서 처리

## 결정사항
- (권고, 미확정) 신규 300개 글 추가 작성 보류: 애드센스 승인 전 대량 발행은 최대 리스크
- WordPress 항목: 현재 Vite/Vercel 사이트라 플러그인·테마·댓글 작업은 패스
- sitemap/RSS: 정적 파일 대신 Vercel API 동적 응답 사용
- 대표 URL: `https://runmania.kr`

## 주의
- 마지막 발행 2026-08-07, 이후 발행 없음 (예약 큐 상태 미확인)
- main에 stash 1건: `wip-prerender-before-adsense` (scripts/prerender.ts)
- ads.txt 확인: `google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0`
- 로컬 dev API 검증 시 `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` 환경변수 필요 (로컬 .env에 없음)
