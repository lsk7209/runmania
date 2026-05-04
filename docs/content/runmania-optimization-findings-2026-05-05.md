# RunMania 최적화 점검 기록

## GSC

- 수집 기간: 2026-04-05 ~ 2026-05-02
- 속성: `https://runmania.kr/`
- 분석 결과: 자동 이슈 0개
- 현재 데이터 규모가 작음
  - 쿼리: `발분석` 노출 1, 클릭 0, 평균 순위 47
  - 페이지: 홈 노출 2, 클릭 1, 평균 순위 24
- 판단: CTR 개선보다 색인 기반 확장이 먼저다. sitemap/RSS가 블로그 39개를 노출하지 못한 문제가 우선순위 1이다.

## AdSense

- 계정: `pub-3050601904412736`
- `runmania.kr` 사이트 상태: `GETTING_READY`
- 계정 pending task: `phone-pin-verification`
- policy issues: 0개
- alerts: 4개
  - payment-hold: 결제 계정 확인 필요
  - youtube-check-tax-info: 세금 정보 확인 필요
  - ua-conflict-policy-update: 우크라이나 관련 정책 알림
  - dormant-site-warning: 일부 사이트 장기 광고 미노출 경고
- 조치: `index.html`에 AdSense account meta와 script를 추가하고, 광고 과다 배치 없이 검수 준비 신호만 먼저 넣는다.

## GA4

- 현재 `G-01M1XY4FM1` gtag 설치 확인.
- 로컬에 GA4 Data API property id/권한 정보는 없음.
- 조치: `trackEvent()` 유틸리티를 추가하고 홈 CTA, 도구 클릭, 글 75% 읽기 이벤트를 코드화한다.

## Sitemap/RSS

- 공개 `/sitemap.xml`은 기존 정적 산출물 때문에 URL 12개, `lastmod` 0개였다.
- 공개 `/api/sitemap`은 DB 기반으로 URL 51개, 블로그 `lastmod` 39개를 반환한다.
- 공개 `/rss.xml`은 기존 정적 산출물 때문에 item 0개였다.
- 공개 `/api/rss`는 DB 기반으로 item 39개를 반환한다.
- 조치: Vite 빌드에서 정적 `dist/sitemap.xml`, `dist/rss.xml`을 만들지 않게 하고 Vercel rewrite가 API를 사용하게 한다.
