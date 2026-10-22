# Status | 마지막: 2026-10-22

## 현재 작업
애드센스 승인 준비 (브랜치 `claude/fervent-bohr-dqcf8c`). 내부 점수 68/100, 신청 전.
발행 글 635편 전수 감사 완료 → `docs/content-audit-2026-10.md`, `docs/content-audit-table.md`

## 최근 변경 (최근 5개만)
- 10-22: 중복 12쌍 301 통합 (`api/indexPolicy.ts` REDIRECTED_POSTS ↔ `vercel.json`)
- 10-22: 본문 깨진 마커·내부 링크 응답 시점 정리 (`api/contentSanitizer.ts`), 공개 API 내부 필드 차단
- 10-22: 템플릿 글 200편 noindex + sitemap·RSS·블로그 목록 제외
- 10-22: prerender About/Contact/Privacy/Terms 메타 한국어화
- 10-22: 발행 글 635편 전수 감사 (`docs/content-audit-2026-10.md`)

## TODO
- [ ] 배포 후 2~4주: GSC로 noindex 200편 클릭 확인 → 삭제(410) 또는 301 (그때 링크 33개 정리)
- [ ] DB 접근 시: 깨진 마커·링크 원본 수정, 통합 글 고유 문단을 대표글로 이전
- [ ] 고유 자료 계획, 운영자 프로필, 건강 글 47편 출처·감수 구조
- [ ] 예약 대기 글 확인 (DB 필요), 이미지 출처 확인
- [ ] AdSense 결제 보류/전화 PIN 확인은 계정 콘솔에서 처리

## 결정사항
- (권고, 미확정) 신규 300개 글 추가 작성 보류: 애드센스 승인 전 대량 발행은 최대 리스크
- WordPress 항목: 현재 Vite/Vercel 사이트라 플러그인·테마·댓글 작업은 패스
- sitemap/RSS: 정적 파일 대신 Vercel API 동적 응답 사용
- 대표 URL: `https://runmania.kr`

## 주의
- 리다이렉트 추가 시 `api/indexPolicy.ts`와 `vercel.json`을 함께 수정 (테스트가 일치 여부 검사)
- 마지막 발행 2026-08-07, 이후 발행 없음 (예약 큐 상태 미확인)
- main에 stash 1건: `wip-prerender-before-adsense` (scripts/prerender.ts)
- ads.txt 확인: `google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0`
- 로컬 dev API 검증 시 `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` 환경변수 필요 (로컬 .env에 없음)
