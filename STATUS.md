# Status | 마지막: 2026-05-05

## 현재 작업
RunMania 제목 200개 추가, 글 2편 생성·예약 완료. 현재 대기 작업 없음.

## 최근 변경 (최근 5개만)
- 05-05: 중복 검수 후 제목 200개 DB 추가, 글 2편 생성·예약(15:00/20:00 KST)
- 05-05: 공개 URL 재검증 완료(`/sitemap.xml` 55 URL, RSS/feed 43 item, raw 마크다운 없음)
- 05-05: 글 상세 본문 `>`, `-`, `- [ ]` 마크다운 렌더링 보강 및 브라우저 검증
- 05-05: GitHub push 후 공개 배포 확인, GSC sitemap/RSS 제출
- 05-05: IndexNow 53 URL 제출 및 동적 sitemap 제출 로직 보강

## TODO
- [ ] AdSense 결제 보류/전화 PIN 확인은 계정 콘솔에서 처리

## 결정사항
- WordPress 항목: 현재 Vite/Vercel 사이트라 플러그인·테마·댓글 작업은 패스
- sitemap/RSS: 정적 파일 대신 Vercel API 동적 응답 사용
- 자동 발행: 기본 간격 5시간
- 대표 URL: `https://www.runmania.kr`

## 주의
- 운영 DB 상태: idea draft 495개, reviewing 4개, scheduled 6개, published 43개 확인
- 신규 예약: 2026-05-07 15:00 KST `나이키 훈련화 선택 기준, 쿠션·반발·발볼`
- 신규 예약: 2026-05-07 20:00 KST `아식스 안정화 선택 기준, 착지·무릎·장거리`
- 공개 URL 확인 완료: `/sitemap.xml` 55 URL, `/rss.xml`·`/feed.xml` 43 item
- AdSense API 확인: `payment-hold`, `phone-pin-verification`은 콘솔 본인 처리 필요
- ads.txt 확인: `google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0`
- 로컬 dev API 검증 시 `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` 환경변수 필요
