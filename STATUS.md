# Status | 마지막: 2026-10-23

## 현재 작업
애드센스 승인 준비 (브랜치 `claude/fervent-bohr-dqcf8c`). 내부 점수 약 79~80/100(추정), 85는 현 조건에서 불가(실명·1차 자료·감수 없음), 신청 전.
발행 글 635편 전수 감사 완료 → `docs/content-audit-2026-10.md`, `docs/content-audit-table.md`

## 최근 변경 (최근 5개만)
- 10-23: 리뷰 21개 프리렌더(직접접속 404 해소)·사이트맵 연동, 가격 JSON-LD 오류 제거, 진단 입력 개편(mm 입력·착용경험·와이드옵션 규칙), 블로그 검색/분류/24개 페이지, 홈·인트로 문구, 분석 이벤트 4종, 출처 블록(productFacts), 사이트맵 lastmod 제거. 커밋 3fdfbeb·브랜치 푸시·Vercel 프리뷰 빌드 성공(프리뷰는 로그인 보호로 미검증)
- 10-23: /methodology 신설, 진단 결과 의료 표현 완화, LCP 개선(폰트 비차단·API 캐시·선로딩)
- 10-23: 고유 자료 계획서, 건강 글 안내 박스, AI 일러스트 캡션, 근거 없는 "전문가" 표현 완화
- 10-22: 중복 12쌍 301 통합 (`api/indexPolicy.ts` REDIRECTED_POSTS ↔ `vercel.json`)
- 10-22: 본문 깨진 마커·내부 링크 응답 시점 정리 (`api/contentSanitizer.ts`), 공개 API 내부 필드 차단

## TODO
- [ ] 프리뷰 URL(runmania-5i9s0ohvo-limsubs-projects.vercel.app) 로그인 후 /reviews/<슬러그> 직접접속·새로고침 확인 → 통과 시 main 병합·프로덕션 배포(승인 필요)
- [ ] 배포 후 운영 검증: /reviews/<슬러그> 21개 200, 없는 슬러그 404 (빌드 시 Turso env 없으면 블로그 프리렌더 생략됨)
- [ ] DB 블로그 본문의 카야노 31·페가수스 41 연도·1080 v13 드롭 원문 대조 (로컬 코드엔 해당 문구 없음)
- [ ] reviewContent.ts 미연결 리뷰 8개(클리프턴 9, 님버스 26 등) 삭제 vs 모델 추가 결정
- [ ] 미구현: 제품 데이터 공통 계층, 평점/후기 분리, 콘텐츠 유형 라벨, 발행 전 점검 스크립트, 홈 재구성, 접근성·Lighthouse
- [ ] 제품 데이터 모델/폭 옵션 분리(현재 이름에 "(2E)" 포함), 폭 옵션 국내 판매 확인
- [ ] 배포 후 PageSpeed 재측정 (홈 67/LCP 4.4s, 글 64/LCP 7.6s 였음, 목표 ≥85)
- [ ] 배포 후 2~4주: GSC로 noindex 200편 클릭 확인 → 삭제(410) 또는 301 (그때 링크 33개 정리)
- [ ] DB 접근 시: 깨진 마커·링크 원본 수정, 통합 글 고유 문단을 대표글로 이전
- [ ] 고유 자료 확보 실행 (`docs/unique-data-plan.md`), 감수자 확정 시 `src/data/medicalReview.ts` 입력
- [ ] 운영자 이름·경력 받으면 About·작성자 JSON-LD·푸터 반영
- [ ] 예약 대기 글 확인 (DB 필요)
- [ ] 신발 이미지 10장은 AI 일러스트(캡션 표기 중) → 직접 촬영본으로 교체
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
