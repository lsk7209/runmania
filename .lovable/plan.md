

## 유틸리티 통합 페이지 계획

현재 "페이스 계산기"와 "사이즈 변환"이 헤더에 개별 메뉴로 노출되어 있습니다. 이를 하나의 "유틸리티" 메뉴 아래 통합 페이지로 모읍니다.

### 변경 사항

1. **`src/pages/Tools.tsx` 생성** — 유틸리티 허브 페이지
   - 탭(Tabs) UI로 "페이스 계산기"와 "사이즈 변환기"를 한 페이지에 표시
   - URL 해시 또는 탭 상태로 두 도구 간 전환 (`/tools`, `/tools?tab=pace`, `/tools?tab=size`)
   - 각 도구의 기존 컴포넌트 로직을 그대로 임베드

2. **`src/components/Header.tsx` 수정** — 네비게이션 정리
   - `navItems`에서 "페이스 계산기", "사이즈 변환" 두 항목을 제거
   - "유틸리티" (`/tools`) 항목 하나로 대체
   - 순서: 홈 → 발 진단 → 신발 리뷰 → 유틸리티 → 블로그

3. **`src/App.tsx` 수정** — 라우팅
   - `/tools` 경로에 `Tools` 페이지 추가
   - 기존 `/tools/pace-calculator`, `/tools/size-converter` 경로는 `/tools`로 리다이렉트 처리 (호환성)

4. **기존 페이지 유지** — `PaceCalculator.tsx`, `SizeConverter.tsx`는 컴포넌트로 재활용하되, 독립 페이지 접근 시 `/tools`로 리다이렉트

