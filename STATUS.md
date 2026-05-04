# Status | 마지막: 2026-05-05

## 현재 작업
글 본문 마크다운 렌더링 보강 배포 확인 완료. 현재 대기 작업 없음.

## 최근 변경 (최근 5개만)
- 05-05: 공개 URL 재검증 완료(`/sitemap.xml` 55 URL, RSS/feed 43 item, raw 마크다운 없음)
- 05-05: 글 상세 본문 `>`, `-`, `- [ ]` 마크다운 렌더링 보강 및 브라우저 검증
- 05-05: GitHub push 후 공개 배포 확인, GSC sitemap/RSS 제출
- 05-05: IndexNow 53 URL 제출 및 동적 sitemap 제출 로직 보강
- 05-05: cron 발행 후 글 URL IndexNow 자동 제출 추가, ads.txt 공개 확인

## TODO
- [ ] AdSense 결제 보류/전화 PIN 확인은 계정 콘솔에서 처리

## 결정사항
- WordPress 항목: 현재 Vite/Vercel 사이트라 플러그인·테마·댓글 작업은 패스
- sitemap/RSS: 정적 파일 대신 Vercel API 동적 응답 사용
- 자동 발행: 기본 간격 5시간
- 대표 URL: `https://www.runmania.kr`

## 주의
- 운영 DB 상태: idea draft 298개, scheduled 4개, published 43개 확인
- 신규 예약: 2026-05-07 05:00 KST, 2026-05-07 10:00 KST
- 공개 URL 확인 완료: `/sitemap.xml` 55 URL, `/rss.xml`·`/feed.xml` 43 item
- AdSense API 확인: `payment-hold`, `phone-pin-verification`은 콘솔 본인 처리 필요
- ads.txt 확인: `google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0`
- 로컬 dev API 검증 시 `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` 환경변수 필요
