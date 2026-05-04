# Status | 마지막: 2026-05-05

## 현재 작업
RunMania AdSense/SEO/콘텐츠 최적화 1차 완료, 운영 DB 콘텐츠 등록 완료.

## 최근 변경 (최근 5개만)
- 05-05: AdSense 메타/스크립트와 홈 검수용 정보 섹션 추가
- 05-05: sitemap/RSS 정적 산출물 제거, API 기반 동적 제공으로 전환
- 05-05: cron 예약 발행 우선순위 수정 및 기본 발행 간격 5시간 적용
- 05-05: GitHub push 후 공개 배포 확인, GSC sitemap/RSS 제출
- 05-05: 운영 DB에 제목 100개 등록, 글 1개 발행·1개 예약

## TODO
- [ ] AdSense 결제 보류/전화 PIN 확인은 계정 콘솔에서 처리

## 결정사항
- WordPress 항목: 현재 Vite/Vercel 사이트라 플러그인·테마·댓글 작업은 패스
- sitemap/RSS: 정적 파일 대신 Vercel API 동적 응답 사용
- 자동 발행: 기본 간격 5시간

## 주의
- 운영 DB 상태: idea draft 100개, `running-shoe-width-d-2e-4e` 발행, `knee-pain-running-shoes-check-3` 예약
- AdSense runmania.kr 상태는 GETTING_READY, policy issue는 0개
- 공개 URL 확인 완료: `/sitemap.xml` 53 URL, `/rss.xml`·`/feed.xml` 41 item
