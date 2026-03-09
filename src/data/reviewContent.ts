export interface ReviewContent {
  pros: string[];
  cons: string[];
  verdict: string;
  rating: number;
  detailedReview: string;
  idealFor: string[];
  notFor: string[];
  tips: string[];
  faq: { q: string; a: string }[];
}

export const reviewData: Record<string, ReviewContent> = {
  "아식스 젤카야노 30": {
    pros: ["최고 수준의 안정성", "편평족에 최적화", "4D Guidance System", "장거리에 적합"],
    cons: ["무거운 편", "가격대가 높음", "발볼 4E 미지원"],
    verdict: "편평족이나 오버프로네이션 러너에게 교과서적인 선택. 안정성 최강자.",
    rating: 4.5,
    detailedReview:
      "아식스 젤카야노 30은 안정성 러닝화의 대명사로, 30세대에 걸쳐 검증된 기술력이 집약된 모델입니다. 4D Guidance System은 발이 안쪽으로 과도하게 꺾이는 오버프로네이션을 자연스럽게 교정해주며, FF Blast Plus 미드솔은 푹신하면서도 반발력을 유지합니다.\n\n착용감은 발을 감싸 안는 듯한 안정적인 핏이 특징입니다. 힐 카운터가 발뒤꿈치를 단단히 잡아주어 장거리에서도 발이 신발 안에서 흔들리지 않습니다. 아치 서포트가 확실하여 편평족 러너들이 \"처음으로 편한 신발\"이라고 평가하는 경우가 많습니다.\n\n10km 이상 장거리 조깅이나 마라톤 훈련에 최적화되어 있으며, 일상 조깅용으로도 충분합니다. 다만 310g의 무게는 스피드를 추구하는 러너에게는 부담이 될 수 있습니다.",
    idealFor: ["편평족 러너", "오버프로네이션 교정 필요", "장거리 러닝 (10km+)", "발목 불안정 러너"],
    notFor: ["가벼운 신발 선호", "넓은 발볼 (4E 필요)", "스피드 트레이닝"],
    tips: [
      "평소 신는 사이즈와 동일하게 선택하세요. 핏이 정확한 편입니다.",
      "처음 안정화를 신는다면 1~2주 적응 기간이 필요합니다. 짧은 거리부터 시작하세요.",
      "2E 모델이 있으니 발볼이 넓다면 2E를 선택하세요. 표준은 다소 좁게 느껴질 수 있습니다.",
    ],
    faq: [
      { q: "젤카야노 30은 초보자도 신어도 되나요?", a: "네, 오히려 초보자에게 강력 추천합니다. 안정성이 뛰어나 아직 러닝 폼이 잡히지 않은 입문자의 부상 방지에 효과적입니다." },
      { q: "편평족이 아니어도 신을 수 있나요?", a: "가능하지만, 정상 아치 러너에게는 안정성 기능이 과할 수 있습니다. 오버프로네이션이 없다면 뉴트럴 신발을 추천합니다." },
      { q: "카야노 29와 30의 차이는?", a: "30세대에서 FF Blast Plus 폼이 업그레이드되어 반발력이 개선되었고, 상단 메시가 더 통기성 좋게 변경되었습니다. 무게는 거의 동일합니다." },
    ],
  },
  "뉴발란스 프레시폼 1080 v13 (2E)": {
    pros: ["4E까지 지원", "푹신한 쿠셔닝", "입문자 친화적", "넓은 발볼에 최적"],
    cons: ["반발력이 약함", "무거운 편", "디자인 호불호"],
    verdict: "넓은 발볼 + 편안한 쿠셔닝을 원한다면 첫 번째 선택지.",
    rating: 4.3,
    detailedReview:
      "뉴발란스 1080 v13은 '편안함의 교과서'라 불릴 만한 모델입니다. 프레시폼 X 미드솔은 구름 위를 걷는 듯한 푹신함을 제공하며, 표준/2E/4E 세 가지 발볼 옵션으로 어떤 발 형태든 압박 없는 피팅을 보장합니다.\n\n특히 2E, 4E 모델은 발볼이 넓어 기존 러닝화에서 옆면 압박을 느꼈던 러너들에게 해방감을 줍니다. 어퍼의 니트 소재는 부드럽고 통기성이 좋아 장시간 착용해도 답답하지 않습니다.\n\n데일리 조깅, 회복 런, 출퇴근 겸용으로 활용도가 높습니다. 다만 프레시폼 특유의 부드러운 쿠셔닝은 에너지 리턴이 약해 빠른 페이스에는 적합하지 않습니다.",
    idealFor: ["발볼이 넓은 러너", "입문자 / 초보 러너", "쿠셔닝 중시", "장시간 편안함 추구"],
    notFor: ["스피드 러닝", "반발력 중시 러너", "가벼운 신발 선호"],
    tips: [
      "발볼이 넓다면 2E, 매우 넓다면 4E를 선택하세요. 표준은 일반적인 발볼 기준입니다.",
      "러닝 양말을 신은 상태에서 피팅하세요. 맨발과 양말 착용 시 핏 차이가 큽니다.",
      "쿠셔닝이 부드러운 만큼 500km 이상 주행 시 밑창이 눌릴 수 있습니다. 교체 시기를 체크하세요.",
    ],
    faq: [
      { q: "2E와 4E의 차이가 크나요?", a: "네, 꽤 큽니다. 2E는 표준보다 약 6mm, 4E는 약 12mm 넓습니다. 발볼 260mm 이상이면 4E를 추천합니다." },
      { q: "다른 브랜드 270mm인데 1080도 270 신으면 되나요?", a: "네, 뉴발란스 1080은 사이즈가 정확한 편입니다. 다만 2E/4E 선택이 더 중요하니 발볼 기준으로 결정하세요." },
      { q: "조깅 외에 일상용으로도 괜찮나요?", a: "네, 쿠셔닝이 푹신해서 출퇴근이나 여행용으로도 인기가 많습니다. 다만 무게가 있어 장거리 보행 시 다리 피로를 느낄 수 있습니다." },
    ],
  },
  "호카 본디 8": {
    pros: ["맥시멀 쿠셔닝", "무릎 보호 탁월", "메타로커 기술", "체중 부하 러너에 최적"],
    cons: ["발볼이 좁은 편", "무거움", "디자인 호불호"],
    verdict: "무릎 통증이 있거나 체중이 있는 러너에게 강력 추천. 다만 발볼이 넓으면 주의.",
    rating: 4.4,
    detailedReview:
      "호카 본디 8은 '맥시멀 쿠셔닝'이라는 장르를 대중화시킨 모델입니다. 두꺼운 EVA 미드솔이 지면 충격을 흡수하여 무릎과 관절에 가해지는 부담을 극적으로 줄여줍니다. 메타로커 기술은 발뒤꿈치부터 발끝까지 자연스러운 구름 동작을 유도합니다.\n\n착용 시 바닥이 두꺼운데도 불안정하지 않은 것이 특징입니다. 넓은 베이스가 좌우 흔들림을 잡아주며, 체중이 80kg 이상인 러너도 충분한 쿠셔닝을 체감할 수 있습니다.\n\n다만 발볼이 좁은 편이라 표준 폭이어도 약간 조이는 느낌을 받을 수 있습니다. 2E 옵션이 있으니 매장에서 반드시 신어보고 결정하세요. 장거리 조깅과 회복 런에 최적이며, 발바닥 통증(족저근막염) 완화에도 효과적이라는 평이 많습니다.",
    idealFor: ["무릎 통증 러너", "체중 80kg 이상", "충격 흡수 최우선", "족저근막염 예방"],
    notFor: ["발볼이 넓은 러너", "가벼운 신발 선호", "스피드 러닝"],
    tips: [
      "발볼이 표준이라면 일반 모델, 넓은 편이라면 반드시 와이드(2E)를 선택하세요.",
      "첫 착용 시 밑창 두께에 놀랄 수 있지만, 2~3회 런 후 적응됩니다.",
      "체중이 있는 러너는 쿠셔닝이 빨리 소모될 수 있으니 500km마다 교체를 권장합니다.",
    ],
    faq: [
      { q: "본디 8과 클리프턴의 차이는?", a: "본디가 더 쿠셔닝이 두껍고 무겁습니다. 클리프턴은 가벼운 대신 쿠셔닝이 얇습니다. 무릎 보호가 우선이면 본디, 가벼움이 우선이면 클리프턴을 선택하세요." },
      { q: "발볼이 넓은데 호카를 꼭 신고 싶어요", a: "2E(와이드) 모델을 선택하시고, 매장에서 반드시 시착해보세요. 그래도 좁다면 뉴발란스 모어 v4(4E)를 대안으로 추천합니다." },
      { q: "족저근막염에 정말 효과가 있나요?", a: "의학적 치료를 대체할 수는 없지만, 두꺼운 쿠셔닝이 발바닥 충격을 줄여 통증 완화에 도움이 된다는 러너들의 후기가 많습니다." },
    ],
  },
  "브룩스 아드레날린 GTS 23": {
    pros: ["가이드레일 시스템", "4E 지원", "가벼운 안정화", "가성비 우수"],
    cons: ["쿠셔닝이 평범", "디자인이 투박"],
    verdict: "편평족 + 넓은 발볼이라면 최적의 조합. 가성비 안정화.",
    rating: 4.2,
    detailedReview:
      "브룩스 아드레날린 GTS 23은 전통적인 안정화의 강점을 현대적으로 해석한 모델입니다. 가이드레일 시스템은 단순히 발 안쪽을 딱딱하게 막는 것이 아니라, 발의 자연스러운 움직임은 허용하면서 과도한 내전(프로네이션)만 제어합니다.\n\n가장 큰 장점은 4E까지 지원되는 발볼 옵션입니다. 편평족이면서 발볼이 넓은 러너들이 가장 자주 선택하는 모델로, 안정성과 넓은 핏을 동시에 만족시킵니다. DNA Loft 쿠셔닝은 과하지도 부족하지도 않은 균형 잡힌 착지감을 제공합니다.\n\n15~18만원의 가격대는 안정화 카테고리에서 가성비가 뛰어난 편입니다. 입문자부터 중급자까지 폭넓게 추천할 수 있는 안정화의 정석입니다.",
    idealFor: ["편평족 + 넓은 발볼", "가성비 중시", "안정성 입문자", "일상 조깅러"],
    notFor: ["쿠셔닝 극대화 원함", "스피드 러닝", "디자인 중시"],
    tips: [
      "편평족이면 깔창을 교체하지 마세요. 기본 깔창이 아치 서포트에 최적화되어 있습니다.",
      "발볼 선택이 중요합니다. 표준/2E/4E 중 매장 시착 후 결정하세요.",
      "GTS 시리즈는 모델별 핏 변화가 적어 이전 버전 사용자라면 같은 사이즈로 구매 가능합니다.",
    ],
    faq: [
      { q: "카야노와 GTS 중 어떤 게 나은가요?", a: "안정성은 카야노가 더 강하고, 발볼 옵션은 GTS가 더 다양합니다(4E 지원). 편평족 + 넓은 발볼이면 GTS, 안정성이 최우선이면 카야노를 추천합니다." },
      { q: "가이드레일 시스템이 뭔가요?", a: "발이 과도하게 안쪽으로 기울어지는 것을 방지하는 브룩스 고유 기술입니다. 미드솔 양옆에 가이드 역할을 하는 구조물이 내장되어 있습니다." },
      { q: "GTS 22에서 23으로 바꿀 가치가 있나요?", a: "DNA Loft v2로 쿠셔닝이 소폭 개선되었지만 큰 차이는 아닙니다. 22가 아직 상태 좋다면 교체 시기까지 사용해도 됩니다." },
    ],
  },
  "나이키 페가수스 41": {
    pros: ["반발력 우수", "가벼움", "디자인 세련"],
    cons: ["발볼이 좁음", "넓은 발에 고통", "안정성 부족"],
    verdict: "발볼이 좁은 러너에게는 좋지만, 넓은 발이라면 절대 피해야 할 모델.",
    rating: 3.5,
    detailedReview:
      "나이키 페가수스 41은 나이키 러닝 라인업의 중심축으로, 40년 넘게 이어온 시리즈의 최신작입니다. 리액트X 폼이 적용되어 이전 세대보다 반발력이 크게 향상되었으며, 285g의 무게는 데일리 트레이너치고 가벼운 편입니다.\n\n하지만 가장 큰 약점은 좁은 발볼입니다. 나이키 특유의 슬림한 핏은 발볼이 좁은 러너에게는 딱 맞는 핏이지만, 한국인 평균 발볼 이상이면 옆면 압박이 심합니다. 와이드 옵션도 국내에서는 구하기 어려운 편입니다.\n\n반발력 있는 쿠셔닝과 세련된 디자인을 원하는 러너에게는 매력적이지만, 발볼 적합성을 반드시 먼저 확인해야 합니다. 에어 줌 유닛이 전족부에 내장되어 전족부 착지 러너에게 특히 좋습니다.",
    idealFor: ["발볼 좁은 러너", "반발력 중시", "전족부 착지", "디자인 중시"],
    notFor: ["발볼 넓은 러너", "편평족", "안정성 필요"],
    tips: [
      "반드시 매장에서 시착하세요. 온라인 구매 시 발볼 압박으로 교환 비율이 높습니다.",
      "발볼이 표준이라면 반 사이즈 업(0.5cm)을 고려하세요.",
      "에어 줌 유닛은 약 400km 후부터 체감이 줄어듭니다. 적극적으로 교체 시기를 관리하세요.",
    ],
    faq: [
      { q: "페가수스 40과 41의 차이는?", a: "41에서 리액트X 폼으로 변경되어 반발력이 크게 향상되었고, 전족부 에어 줌 유닛이 추가되었습니다. 전반적으로 40보다 확실히 개선된 모델입니다." },
      { q: "발볼이 넓은데 반 사이즈 올리면 되나요?", a: "사이즈를 올려도 발볼 자체가 넓어지지 않고 길이만 길어집니다. 발볼이 넓다면 뉴발란스 1080(2E/4E)이나 브룩스 GTS를 추천합니다." },
      { q: "일상용(출퇴근)으로도 괜찮나요?", a: "가볍고 디자인이 세련되어 일상용으로도 인기 있습니다. 다만 쿠셔닝이 러닝에 최적화되어 있어 장시간 보행 시 발바닥이 피로할 수 있습니다." },
    ],
  },
  "나이키 베이퍼플라이 3": {
    pros: ["카본 플레이트", "초경량", "기록 갱신용"],
    cons: ["불안정한 구조", "편평족 위험", "가격이 매우 높음", "발볼 좁음"],
    verdict: "상급 러너의 레이싱 전용. 일반 러너에게는 부상 위험.",
    rating: 4.0,
    detailedReview:
      "나이키 베이퍼플라이 3은 세계 기록을 깨뜨린 카본 플레이트 레이싱화의 아이콘입니다. 줌X 폼 + 풀렝스 카본 플레이트 조합은 강력한 추진력을 만들어내며, 186g이라는 초경량은 레이스에서 체감되는 차이를 만들어냅니다.\n\n하지만 이 신발은 명확히 '상급 러너의 레이스 전용'입니다. 카본 플레이트 특유의 불안정한 구조는 러닝 폼이 잡히지 않은 러너에게 발목 부상 위험을 높이며, 편평족 러너는 아치 서포트 부재로 발바닥 통증이 생길 수 있습니다.\n\n28~32만원이라는 높은 가격도 고려해야 합니다. 내구성이 약해 200~300km 후 성능이 급격히 떨어지므로, 연습용으로 사용하기에는 비효율적입니다. 대회용으로만 사용하는 것이 현명합니다.",
    idealFor: ["서브3~서브4 러너", "레이스 전용", "전족부 착지 상급자", "기록 갱신 목표"],
    notFor: ["러닝 입문자", "편평족 러너", "일상 조깅용", "발볼 넓은 러너"],
    tips: [
      "반드시 대회 전에 3~4회 이상 연습 런에서 적응하세요. 카본 플레이트 감각에 익숙해져야 합니다.",
      "내구성이 약하므로 연습용은 사코니 스피드 3 등 트레이너를 사용하고, 베이퍼플라이는 대회용으로만 활용하세요.",
      "사이즈는 정사이즈 또는 반 사이즈 업. 레이스 시 발이 부을 수 있으니 여유를 두세요.",
    ],
    faq: [
      { q: "일반인이 신어도 효과가 있나요?", a: "카본 플레이트의 추진력은 느낄 수 있지만, 러닝 폼이 부족하면 오히려 부상 위험이 높아집니다. 서브4 이상 경험자에게 추천합니다." },
      { q: "알파플라이와 뭐가 다른가요?", a: "베이퍼플라이는 가볍고 반응성이 좋아 순수 레이싱용, 알파플라이는 쿠셔닝이 더 두껍고 장거리에 적합합니다. 하프 이하는 베이퍼플라이, 풀마라톤은 알파플라이가 유리합니다." },
      { q: "200km밖에 못 신나요?", a: "성능(에너지 리턴)은 200~300km 후 크게 떨어지지만 신발 자체가 부서지지는 않습니다. 기록 단축이 목적이 아니라면 그 이후에도 일반 조깅용으로 사용 가능합니다." },
    ],
  },
  "뉴발란스 프레시폼 모어 v4": {
    pros: ["최대 쿠셔닝", "4E 지원", "무릎/관절 보호", "체중 부하에 최적"],
    cons: ["반발력 약함", "무거움"],
    verdict: "체중이 있고 발볼이 넓다면 이 신발. 쿠셔닝의 끝판왕.",
    rating: 4.4,
    detailedReview:
      "뉴발란스 프레시폼 모어 v4는 이름 그대로 '더 많은(More)' 쿠셔닝을 제공하는 맥시멀 러닝화입니다. 호카 본디 8과 쿠셔닝 두께가 비슷하지만, 결정적 차이는 4E까지 지원되는 발볼 옵션입니다. 발볼이 넓으면서 맥시멀 쿠셔닝을 원하는 러너에게 사실상 유일한 선택지입니다.\n\n프레시폼 미드솔은 부드럽고 충격 흡수에 특화되어 있습니다. 체중 80kg 이상 러너가 5km 이상 달릴 때 무릎과 발바닥에 가해지는 충격이 체감적으로 줄어듭니다. 4mm의 낮은 드롭은 발 전체에 고르게 압력을 분산시킵니다.\n\n다만 332g의 무게와 부드러운 쿠셔닝 특성상 반발력은 기대하기 어렵습니다. 느린 페이스의 장거리 조깅이나 회복 런에 최적화된 신발로, 빠른 템포런에는 적합하지 않습니다.",
    idealFor: ["발볼 넓은 + 맥시멀 쿠셔닝", "체중 80kg 이상", "무릎/관절 보호", "회복 런"],
    notFor: ["스피드 러닝", "가벼운 신발 선호", "반발력 중시"],
    tips: [
      "본디 8에서 발볼이 좁았다면 모어 v4(4E)가 완벽한 대안입니다.",
      "쿠셔닝이 매우 두꺼워 처음에 불안정하게 느낄 수 있습니다. 평지에서 적응 후 언덕 코스에 도전하세요.",
      "무게가 있으니 러닝 거리에 집중하되 페이스에는 욕심 내지 마세요.",
    ],
    faq: [
      { q: "본디 8과 모어 v4 중 뭘 골라야 하나요?", a: "발볼이 넓다면 모어 v4(4E 지원), 좁거나 표준이면 본디 8을 추천합니다. 쿠셔닝 수준은 비슷하지만 핏이 크게 다릅니다." },
      { q: "걷기 운동에도 괜찮나요?", a: "네, 두꺼운 쿠셔닝이 걷기 시 관절 보호에도 효과적입니다. 다만 러닝화 특유의 구름 형상(로커)이 있어 처음에는 약간 어색할 수 있습니다." },
      { q: "족저근막염이 있는데 도움이 되나요?", a: "두꺼운 쿠셔닝이 발바닥 충격을 줄여 증상 완화에 도움이 될 수 있습니다. 다만 의료적 치료를 대체하지는 않으니 전문의 상담과 병행하세요." },
    ],
  },
  "사코니 엔돌핀 스피드 3": {
    pros: ["나일론 플레이트", "빠른 템포에 최적", "경량"],
    cons: ["발볼 좁음", "입문자에 부적합", "내구성 보통"],
    verdict: "기록 단축을 노리는 중상급 러너의 트레이닝 슈즈.",
    rating: 4.1,
    detailedReview:
      "사코니 엔돌핀 스피드 3은 카본이 아닌 나일론 플레이트를 탑재한 스피드 트레이너입니다. 카본 플레이트보다 유연하면서도 충분한 추진력을 제공하여, 매일 빠른 페이스로 훈련하기에 적합합니다. 215g의 경량은 발에 부담을 주지 않습니다.\n\nPWRRUN PB 폼은 가볍고 반발력이 좋아 킬로당 5분 이하 페이스에서 날아가는 듯한 감각을 줍니다. 인터벌 훈련, 템포 런, 단거리 레이스 등 속도를 내는 모든 상황에서 진가를 발휘합니다.\n\n다만 발볼이 좁고 쿠셔닝이 얇은 편이라 입문자나 발볼이 넓은 러너에게는 맞지 않습니다. 베이퍼플라이 대비 내구성이 좋아 연습용 스피드 신발로 최적이며, 대회에서도 충분한 성능을 보여줍니다.",
    idealFor: ["중상급 러너", "인터벌/템포 훈련", "레이스 훈련용", "경량 선호"],
    notFor: ["러닝 입문자", "발볼 넓은 러너", "장거리 편안함 추구"],
    tips: [
      "베이퍼플라이 연습용으로 활용하면 비용을 크게 절약할 수 있습니다.",
      "나일론 플레이트는 카본보다 유연해 적응이 쉽습니다. 플레이트 신발 입문으로도 좋습니다.",
      "사이즈는 정사이즈 추천. 핏이 정확한 편입니다.",
    ],
    faq: [
      { q: "카본 플레이트 신발과 차이가 큰가요?", a: "나일론 플레이트는 카본보다 유연하고 안정적입니다. 에너지 리턴은 카본이 우세하지만, 매일 훈련에 사용하기엔 나일론이 더 적합합니다." },
      { q: "풀마라톤에도 신을 수 있나요?", a: "가능하지만 쿠셔닝이 얇아 30km 이후 발바닥 피로가 올 수 있습니다. 풀마라톤은 베이퍼플라이나 알파플라이를 추천합니다." },
      { q: "스피드 2에서 3으로 바뀐 점은?", a: "PWRRUN PB 폼 배합이 변경되어 반발력이 소폭 개선되었고, 어퍼 핏이 더 정교해졌습니다. 큰 변화보다는 완성도 향상 모델입니다." },
    ],
  },
  "아디다스 아디제로 보스턴 12": {
    pros: ["라이트스트라이크 프로", "빠른 템포 런", "경량"],
    cons: ["발볼 좁음", "입문자에 부적합"],
    verdict: "스피드 트레이닝에 최적화. 레이싱 트레이너의 기준.",
    rating: 4.0,
    detailedReview:
      "아디다스 보스턴 12는 아디오스 프로의 DNA를 물려받은 데일리 스피드 트레이너입니다. 라이트스트라이크 프로 폼은 아디다스 최상위 레이싱 기술로, 가벼우면서도 강한 반발력을 제공합니다. 240g의 무게는 스피드 트레이너 중에서도 적절한 수준입니다.\n\n에너지 로드(Energy Rods)가 전족부에 내장되어 발끝 이탈 시 추진력을 높여주며, 킬로당 4:30~5:30 페이스에서 가장 효율적인 러닝을 경험할 수 있습니다. 콘티넨탈 아웃솔은 젖은 노면에서도 그립력이 뛰어납니다.\n\n사코니 스피드 3과 경쟁 모델로, 보스턴은 더 단단하고 반응적인 착지감, 스피드 3은 더 부드럽고 유연한 느낌입니다. 단단한 반발력을 선호한다면 보스턴 12가 더 적합합니다.",
    idealFor: ["스피드 트레이닝", "인터벌/템포 러너", "단단한 반발력 선호", "중상급 러너"],
    notFor: ["러닝 입문자", "발볼 넓은 러너", "편안한 쿠셔닝 추구"],
    tips: [
      "라이트스트라이크 프로 폼은 처음에 딱딱하게 느껴질 수 있지만 3~4회 런 후 적응됩니다.",
      "콘티넨탈 아웃솔이 내구성이 좋아 700km까지도 사용 가능합니다.",
      "사코니 스피드 3과 둘 다 신어보고 착지감 선호에 따라 선택하세요.",
    ],
    faq: [
      { q: "아디오스 프로와 차이가 뭔가요?", a: "아디오스 프로는 카본 플레이트가 들어간 순수 레이싱화이고, 보스턴은 에너지 로드가 들어간 데일리 트레이너입니다. 훈련은 보스턴, 대회는 아디오스 프로 조합이 이상적입니다." },
      { q: "보스턴 11에서 12로 바꿀 가치가 있나요?", a: "12에서 라이트스트라이크 프로 폼 비율이 높아져 반발력이 개선되었습니다. 11을 좋아했다면 12도 만족할 가능성이 높습니다." },
      { q: "발볼이 넓은 편인데 보스턴을 신을 수 있나요?", a: "아디다스는 전반적으로 핏이 좁은 편입니다. 발볼이 넓다면 사코니 스피드 3(약간 더 넓음)이나 뉴발란스 퓨얼셀 RC 엘리트를 대안으로 검토하세요." },
    ],
  },
  "알트라 토린 7": {
    pros: ["넓은 토박스", "자연스러운 발 형태", "족저근막에 좋음"],
    cons: ["제로 드롭 적응 필요", "안정성 부족", "호불호 큼"],
    verdict: "발가락 자유도를 원하는 러너에게. 제로 드롭에 적응 필요.",
    rating: 3.8,
    detailedReview:
      "알트라 토린 7은 '풋셰이프(FootShape)' 디자인 철학을 대표하는 모델입니다. 발가락이 자연스럽게 펼쳐지는 넓은 토박스는 기존 러닝화에서 느꼈던 발가락 압박을 완전히 해소합니다. 무지외반증이나 발가락 겹침 문제가 있는 러너들이 특히 선호합니다.\n\n제로 드롭(0mm) 설계는 발뒤꿈치와 앞발이 같은 높이에 놓여 맨발에 가까운 자연스러운 자세를 유도합니다. 이는 아킬레스건과 종아리 근육의 유연성을 개선하지만, 기존 러닝화(8~12mm 드롭)에서 전환 시 적응 기간이 반드시 필요합니다.\n\n쿠셔닝은 중간 수준으로 맥시멀 쿠셔닝을 기대하기는 어렵지만, 발 자체의 자연스러운 충격 흡수 능력을 살려주는 방향으로 설계되었습니다. 미니멀리스트 러닝에 관심이 있거나 발 건강을 중시하는 러너에게 추천합니다.",
    idealFor: ["넓은 토박스 필요", "무지외반증", "자연스러운 발 움직임 추구", "제로 드롭 경험자"],
    notFor: ["제로 드롭 미경험자 (급전환 위험)", "안정성 필요 러너", "강한 쿠셔닝 원함"],
    tips: [
      "기존 러닝화에서 전환 시 2~4주간 짧은 거리(2~3km)부터 시작하세요. 종아리 통증이 올 수 있습니다.",
      "사이즈는 반 사이즈 업을 추천합니다. 토박스가 넓지만 길이는 표준입니다.",
      "제로 드롭 적응을 위해 일상에서도 플랫 슈즈를 신는 것이 도움됩니다.",
    ],
    faq: [
      { q: "제로 드롭이 정말 좋은 건가요?", a: "장단이 있습니다. 자연스러운 발 역학과 자세 교정에 도움이 되지만, 적응 없이 급전환하면 아킬레스건이나 종아리 부상 위험이 있습니다. 천천히 전환하는 것이 핵심입니다." },
      { q: "편평족인데 토린 7 신어도 되나요?", a: "제로 드롭 + 안정성 부족은 편평족에게 부담이 될 수 있습니다. 편평족이라면 카야노 30이나 GTS 23 같은 안정화를 추천합니다." },
      { q: "토린 7과 론 피크의 차이는?", a: "토린은 로드(도로)용, 론 피크는 트레일용입니다. 도심 러닝이면 토린, 산길이나 비포장도로면 론 피크를 선택하세요." },
    ],
  },
  "ASICS Novablast 5": {
    pros: ["Energetic rebound", "Smooth daily trainer", "Comfortable forefoot"],
    cons: ["Not very stable for heavy overpronators", "Upper fit can feel average"],
    verdict: "A strong all-rounder for runners who want a lively daily trainer without moving to a plated shoe.",
    rating: 4.4,
    detailedReview:
      "ASICS Novablast 5 is built for runners who want bounce without the harshness of an aggressive speed shoe. The midsole feels lively at easy pace and stays useful when the run naturally speeds up.\n\nThe best part of this shoe is its versatility. It works for relaxed daily mileage, steady efforts, and even moderate tempo sessions. The underfoot feel is softer than a traditional trainer but not unstable enough to feel risky for most neutral runners.\n\nThe main limitation is guidance. If you need real stability or if your ankles collapse late in runs, Novablast 5 will not replace a true support shoe. For neutral runners, though, it is one of the easiest shoes to recommend.",
    idealFor: ["Neutral runners", "Daily training", "Runners who want rebound"],
    notFor: ["Strong overpronators", "Runners seeking a firm ride"],
    tips: [
      "Use it as a main daily trainer and save plated shoes for harder sessions.",
      "If you are between sizes, check forefoot fit carefully because upper volume is moderate.",
      "Neutral mechanics will get the best value from this model.",
    ],
    faq: [
      { q: "Is Novablast 5 good for beginners?", a: "Yes. It is lively but still forgiving enough for most beginner neutral runners." },
      { q: "Can it handle tempo runs?", a: "Yes. It is not a pure speed shoe, but it handles steady and moderate tempo work well." },
      { q: "Is it stable?", a: "It is stable enough for many neutral runners, but it is not a true support shoe." },
    ],
  },
  "Hoka Clifton 10": {
    pros: ["Easy comfort", "Smooth rocker", "Good for walking and running"],
    cons: ["Less exciting rebound", "Can feel ordinary for fast runs"],
    verdict: "A dependable comfort-focused trainer for runners who value consistency over flashy speed.",
    rating: 4.2,
    detailedReview:
      "Hoka Clifton 10 stays close to the formula that made the line popular: light cushioning, a smooth rocker, and very low drama. This is the type of shoe that disappears on foot, which is a strength for most daily runners.\n\nIt handles easy mileage, commute runs, and long walking days well. The cushioning is comfortable without becoming sloppy, and the transition feels natural even for runners who do not want a heavily plated or highly aggressive shape.\n\nThe weakness is excitement. If you want a shoe that pushes you forward or gives strong rebound, Clifton 10 will feel too calm. But if the goal is reliable daily comfort, it does the job well.",
    idealFor: ["Beginners", "Easy runs", "Comfort-first runners"],
    notFor: ["Fast workout focus", "Runners seeking strong rebound"],
    tips: [
      "Best used as an easy-day or all-purpose comfort trainer.",
      "Wide-foot runners should compare standard and wide options if available.",
      "If you already own a speed shoe, Clifton works well as the calm counterpart.",
    ],
    faq: [
      { q: "Is Clifton 10 good for long runs?", a: "Yes. It is especially good for comfortable long runs at relaxed pace." },
      { q: "Is it soft or firm?", a: "It leans comfortable and moderately soft, not mushy." },
      { q: "Can beginners use it as a first shoe?", a: "Yes. It is one of the safer first-shoe options for neutral runners." },
    ],
  },
  "Brooks Ghost 16": {
    pros: ["Predictable ride", "Wide size options", "Very easy to recommend"],
    cons: ["Not exciting", "Heel drop may feel high for some runners"],
    verdict: "A practical and safe neutral trainer that prioritizes consistency over novelty.",
    rating: 4.1,
    detailedReview:
      "Brooks Ghost 16 is the classic neutral daily trainer for runners who want no surprises. The ride is balanced, the platform is stable for a neutral model, and the sizing options are one of its biggest strengths.\n\nThis shoe works well for beginners, heavier runners who still want a neutral shoe, and anyone who values straightforward comfort. It does not feel especially fast, but it does enough things well that it stays useful for a large group of runners.\n\nIf you want bounce or a premium modern foam feel, Ghost 16 may seem plain. If you want a dependable shoe that behaves the same way every day, it is excellent.",
    idealFor: ["Beginners", "Wide-foot runners", "Steady daily mileage"],
    notFor: ["Runners chasing bounce", "Minimal-drop preference"],
    tips: [
      "A safe default if you are unsure where to start.",
      "Wide-foot runners should check 2E or 4E options first.",
      "Pairs well with a separate faster shoe for workouts.",
    ],
    faq: [
      { q: "Is Ghost 16 stable?", a: "For a neutral shoe, yes. It is not a support model, but it feels planted and predictable." },
      { q: "Is it good for wide feet?", a: "Yes. Its width options are one of its strongest points." },
      { q: "Can it be a one-shoe rotation?", a: "Yes. For many runners it works well as a single daily trainer." },
    ],
  },
  "Saucony Triumph 22": {
    pros: ["Plush long-run comfort", "Premium foam feel", "Strong recovery-run option"],
    cons: ["Not very nimble", "Heavier than tempo-focused trainers"],
    verdict: "A comfort-heavy long-run shoe for runners who want softness and protection over speed.",
    rating: 4.5,
    detailedReview:
      "Saucony Triumph 22 leans into premium comfort. The foam volume is generous, the underfoot feel is protective, and the overall experience is built around smooth easy mileage rather than aggressive pace work.\n\nIt shines on recovery days and long aerobic runs. When your legs are tired and you still need volume, this is the kind of shoe that reduces harshness and keeps the run manageable.\n\nThe tradeoff is agility. It is not the shoe you pick when you want sharp turnover. For runners who care more about comfort and durability, that trade is usually worth it.",
    idealFor: ["Long runs", "Recovery runs", "Runners wanting plush cushioning"],
    notFor: ["Track work", "Runners wanting a light shoe"],
    tips: [
      "Use it on high-fatigue days when your legs need protection.",
      "It works especially well as a long-run complement to a lighter trainer.",
      "Do not expect race-day sharpness from this model.",
    ],
    faq: [
      { q: "Is Triumph 22 good for long runs?", a: "Yes. Long aerobic mileage is one of its best use cases." },
      { q: "Is it too soft?", a: "For some runners it may feel very plush, but many will find it controlled enough for easy running." },
      { q: "Can beginners use it?", a: "Yes, especially if they value comfort and do not mind a slightly heavier shoe." },
    ],
  },
  "Nike Invincible 3": {
    pros: ["Very soft underfoot", "Excellent impact protection", "Easy-day comfort"],
    cons: ["Can feel unstable", "Fit is not ideal for every foot"],
    verdict: "A max-soft option for runners who want easy-run comfort and are willing to manage some instability.",
    rating: 4.1,
    detailedReview:
      "Nike Invincible 3 is all about softness. The ZoomX feel is highly cushioned and very forgiving on tired legs, which makes this shoe appealing for easy days and runners who want maximum impact reduction.\n\nWhere it becomes more complicated is stability. The soft platform can feel less controlled than support-minded or more grounded trainers, especially for runners who roll inward or get sloppy late in runs.\n\nIf your mechanics are reasonably neutral and you love soft cushioning, Invincible 3 is enjoyable. If you need a very planted platform, there are safer options.",
    idealFor: ["Easy runs", "Heavier runners", "Soft-cushion fans"],
    notFor: ["Runners needing support", "Wide-foot runners with fit issues"],
    tips: [
      "Best used for easy and recovery days rather than fast sessions.",
      "Check heel security carefully because fit feel varies.",
      "If stability matters a lot, compare it with a more structured max-cushion shoe.",
    ],
    faq: [
      { q: "Is Invincible 3 stable?", a: "It is stable enough for some neutral runners, but it is not a support-first model." },
      { q: "Is it good for recovery runs?", a: "Yes. Recovery running is one of its strongest use cases." },
      { q: "Can beginners use it?", a: "Yes, but beginners who need more support should compare other options." },
    ],
  },
  "Puma Deviate Nitro 3": {
    pros: ["Versatile plated ride", "Good value", "Useful for tempo and race prep"],
    cons: ["Not as smooth as top-tier supershoes", "Upper fit may feel narrow"],
    verdict: "A practical plated trainer for runners who want speed-oriented value without paying supershoe prices.",
    rating: 4.3,
    detailedReview:
      "Puma Deviate Nitro 3 sits in a useful middle ground. It gives you a plated feel and a faster ride, but it remains manageable enough for training rather than feeling like a one-purpose race shoe.\n\nThat makes it attractive for tempo runs, progression runs, and runners who want one faster shoe that can still survive regular use. It does not reach the raw efficiency of elite supershoes, but it costs less and asks less adaptation from the runner.\n\nIf you want a versatile plated option rather than a pure race-only weapon, this is one of the better choices.",
    idealFor: ["Tempo runs", "Runners wanting a plated trainer", "Value-focused speed work"],
    notFor: ["Very wide feet", "Runners expecting supershoe softness"],
    tips: [
      "Works best as a workout and event shoe paired with a softer daily trainer.",
      "If fit is borderline, check forefoot width before committing.",
      "Use it for threshold and progression runs to get the most value.",
    ],
    faq: [
      { q: "Is Deviate Nitro 3 a race shoe?", a: "It can race, but it is best described as a versatile plated trainer." },
      { q: "Can beginners use it?", a: "Yes, but beginners do not need it as a first shoe." },
      { q: "Is it good value?", a: "Yes. Value is one of its strongest selling points." },
    ],
  },
  "Mizuno Wave Rider 28": {
    pros: ["Stable feeling ride", "Consistent turnover", "Good durability"],
    cons: ["Firmer than many modern trainers", "Less bounce than premium foams"],
    verdict: "A controlled trainer for runners who prefer structure and consistency over softness.",
    rating: 4.0,
    detailedReview:
      "Mizuno Wave Rider 28 is for runners who still like a firmer and more controlled road feel. It does not chase the softest cushioning trend and that is exactly why some runners keep coming back to it.\n\nThe platform feels steady, transitions are clean, and the shoe rewards runners who want a direct connection to the ground without moving into minimal territory. Durability is also one of the reasons this line stays relevant.\n\nIf you love soft premium foam, this shoe may feel old-school. If you want crisp and dependable, it still makes a lot of sense.",
    idealFor: ["Runners preferring firmer shoes", "Daily mileage", "Stable-feel neutral runners"],
    notFor: ["Soft-cushion lovers", "Runners wanting high rebound"],
    tips: [
      "A good choice if many soft trainers feel sloppy to you.",
      "Works well as a winter or bad-weather training shoe because of its predictable ride.",
      "Compare with Ghost if you want a similar practical trainer with a different feel.",
    ],
    faq: [
      { q: "Is Wave Rider 28 soft?", a: "Not especially. It leans more controlled and moderately firm." },
      { q: "Is it durable?", a: "Yes. Durability is one of the line's stronger points." },
      { q: "Who should avoid it?", a: "Runners who want very soft landings or a trampoline-like ride." },
    ],
  },
  "On Cloudmonster 2": {
    pros: ["Distinct rocker feel", "Bouncy for a max shoe", "Good for long steady runs"],
    cons: ["Price is high", "Ride feel is not for everyone"],
    verdict: "A premium max-cushion option with a firmer bounce and unique rocker character.",
    rating: 4.2,
    detailedReview:
      "On Cloudmonster 2 stands out because it does not feel like a typical soft max-cushion shoe. It gives more pop and rocker-driven momentum, which some runners will love and others will find too artificial.\n\nFor long steady mileage, it can feel efficient and surprisingly lively. It is also better for runners who dislike mushy max-cushion shoes but still want stack height and protection.\n\nThe obvious drawback is price. You need to like the ride character enough to justify paying for it, because there are cheaper shoes that deliver more conventional comfort.",
    idealFor: ["Long runs", "Runners who want bounce with stack", "Premium buyers"],
    notFor: ["Budget-focused runners", "People wanting very soft cushioning"],
    tips: [
      "Try it if traditional max-cushion shoes feel too dead or too soft.",
      "Best appreciated on long steady road runs.",
      "Make sure the rocker geometry feels natural for your gait before buying.",
    ],
    faq: [
      { q: "Is Cloudmonster 2 soft?", a: "It is cushioned, but it feels firmer and bouncier than many max-cushion rivals." },
      { q: "Is it worth the price?", a: "Only if you specifically like the On ride style and rocker feel." },
      { q: "Can it be a daily trainer?", a: "Yes, especially for runners who like a premium, energetic long-run shoe." },
    ],
  },
  "New Balance FuelCell Rebel v4": {
    pros: ["Very light", "Fun and flexible", "Fast feeling without a plate"],
    cons: ["Not the most stable", "Can feel too loose for some runners"],
    verdict: "A highly enjoyable lightweight trainer for runners who want speed feel without plated stiffness.",
    rating: 4.4,
    detailedReview:
      "New Balance FuelCell Rebel v4 is one of the most fun non-plated trainers in this segment. It feels light, quick, and flexible enough to make moderate pace work feel easy.\n\nThat makes it appealing for runners who do not enjoy plated shoes or who want a more natural-feeling fast trainer. It works well for steady progression runs, shorter tempos, and daily miles when you want some energy underfoot.\n\nThe downside is control. It is not the shoe to pick if you need structure, and some runners may want a more secure upper. For neutral runners who value fun, it is excellent.",
    idealFor: ["Tempo runs", "Lightweight trainer fans", "Neutral runners"],
    notFor: ["Runners needing stability", "Heavy heel strikers wanting structure"],
    tips: [
      "Great companion to a more cushioned long-run shoe.",
      "Use it when you want a quick feel without jumping into plated geometry.",
      "Neutral runners will get the best experience.",
    ],
    faq: [
      { q: "Is Rebel v4 a race shoe?", a: "It can race shorter events, but it is mainly a lightweight trainer." },
      { q: "Is it stable?", a: "Stability is not its strength. It is best for neutral runners." },
      { q: "Why choose it over a plated shoe?", a: "Because it feels lighter, more natural, and less rigid underfoot." },
    ],
  },
  "Adidas Adizero SL 2": {
    pros: ["Light and efficient", "Good value", "Works for daily and faster runs"],
    cons: ["Not plush", "Upper refinement is average"],
    verdict: "A strong budget-performance trainer for runners who want one lighter shoe to cover multiple jobs.",
    rating: 4.1,
    detailedReview:
      "Adidas Adizero SL 2 is attractive because it gives a lighter and faster feeling than typical daily trainers without jumping to a full race-focused setup. That makes it useful for runners who want one shoe to cover regular runs and occasional faster work.\n\nIt is not highly cushioned, but the ride feels efficient and controlled enough for a lot of practical training. If your pace is moderate to fast and you like a lighter shoe, it makes sense.\n\nThe comfort level is not as plush as max-cushion trainers, so runners focused on softness should look elsewhere. For value-oriented performance, though, it is very solid.",
    idealFor: ["Value-focused runners", "Moderate tempo work", "Single-shoe rotation seekers"],
    notFor: ["Soft-cushion lovers", "Very long recovery-run focus"],
    tips: [
      "A good option if you want one lighter trainer instead of separate daily and workout shoes.",
      "Compare with Rebel v4 if you prefer more fun over more grounded control.",
      "Best for runners who naturally prefer lighter shoes.",
    ],
    faq: [
      { q: "Is Adizero SL 2 a beginner shoe?", a: "It can work for some beginners, but comfort-first beginners may prefer a softer trainer." },
      { q: "Is it a speed shoe?", a: "It sits between daily trainer and lightweight workout shoe." },
      { q: "Is it good value?", a: "Yes. Value is one of the biggest reasons to buy it." },
    ],
  },
  "Nike Structure 25": {
    pros: ["Useful guidance", "Reliable daily ride", "Good option for mild stability needs"],
    cons: ["Less lively than Pegasus", "Support feel may be unnecessary for neutral runners"],
    verdict: "A sensible daily stability trainer for runners who want more guidance than a neutral Nike model offers.",
    rating: 4.2,
    detailedReview:
      "Nike Structure 25 fills an important role in the lineup by giving runners a more guided ride than Pegasus without moving into an overly harsh support category. It feels more controlled through the midfoot and heel, which is useful for runners who get sloppy late in runs.\n\nThat makes it a good choice for mild to moderate overpronators, heavier runners who want a more centered platform, or Nike users who find neutral trainers too loose in structure. It still behaves like a daily trainer rather than a correction device.\n\nNeutral runners may find the extra guidance unnecessary. For those who want support with familiar Nike fit, though, Structure 25 is easy to justify.",
    idealFor: ["Mild overpronators", "Daily support shoe users", "Nike runners wanting more guidance"],
    notFor: ["Neutral runners wanting a free ride", "Runners chasing bounce"],
    tips: [
      "Best for daily mileage where form drops as fatigue builds.",
      "Compare with Pegasus if you are unsure whether you need support.",
      "A practical option if you want support without a very bulky feel.",
    ],
    faq: [
      { q: "Is Structure 25 a strong stability shoe?", a: "It gives meaningful guidance, but it is not the most aggressive support shoe on the market." },
      { q: "Who should choose it over Pegasus?", a: "Runners who want more structure and support in daily training." },
      { q: "Can beginners use it?", a: "Yes, especially beginners who suspect they need mild stability support." },
    ],
  },
};
