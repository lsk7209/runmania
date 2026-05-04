# Status | 마지막: 2026-05-05

## 현재 작업
RunMania 기술 SEO 보강 완료, 대표 URL·글 상세 메타 배포 확인 대기.

## 최근 변경 (최근 5개만)
- 05-05: GitHub push 후 공개 배포 확인, GSC sitemap/RSS 제출
- 05-05: IndexNow 53 URL 제출 및 동적 sitemap 제출 로직 보강
- 05-05: cron 발행 후 글 URL IndexNow 자동 제출 추가, ads.txt 공개 확인
- 05-05: 제목 200개 추가 생성·DB idea 등록, 글 2편 draft 작성·예약
- 05-05: 대표 URL `www.runmania.kr` 통일, published 글 상세 HTML 43개 프리렌더
- 05-05: cron 발행 후 Bing·Naver IndexNow 동시 제출로 보강

## TODO
- [ ] AdSense 결제 보류/전화 PIN 확인은 계정 콘솔에서 처리

## 결정사항
- WordPress 항목: 현재 Vite/Vercel 사이트라 플러그인·테마·댓글 작업은 패스
- sitemap/RSS: 정적 파일 대신 Vercel API 동적 응답 사용
- 자동 발행: 기본 간격 5시간
- 대표 URL: `https://www.runmania.kr`

## 주의
- 운영 DB 상태: idea draft 298개, scheduled 4개, published 42개
- 신규 예약: 2026-05-07 05:00 KST, 2026-05-07 10:00 KST
- 공개 URL 확인 완료: `/sitemap.xml` 53 URL, `/rss.xml`·`/feed.xml` 41 item
- AdSense API 확인: `payment-hold`, `phone-pin-verification`은 콘솔 본인 처리 필요
- ads.txt 확인: `google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0`
