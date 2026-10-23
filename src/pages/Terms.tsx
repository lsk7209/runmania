import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const sections = [
  {
    title: "1. 서비스 목적",
    body: "런닝화매니아는 러닝화 가이드, 제품 리뷰 요약, 계산기, 일반적인 러닝 정보를 교육·정보 제공 목적으로 게시합니다.",
  },
  {
    title: "2. 콘텐츠의 정확성",
    body: "정보를 최신 상태로 유지하려고 노력하지만 제품 사양, 가격, 재고, 정책은 변경될 수 있습니다. 구매 전에는 판매처 또는 제조사에서 반드시 다시 확인해 주세요.",
  },
  {
    title: "3. 건강 관련 면책",
    body: "본 사이트는 전문적인 의학 조언을 대체하지 않습니다. 러닝 중 통증이나 부상 증상, 훈련 관련 고민은 자격을 갖춘 전문가와 상의해 주세요.",
  },
  {
    title: "4. 광고 및 제휴 링크",
    body: "일부 페이지에는 광고 또는 제휴 링크가 포함될 수 있습니다. 이러한 요소는 러너의 필요, 제품 특성, 실사용 상황에 기반한 편집 기준에 영향을 주지 않습니다.",
  },
  {
    title: "5. AI 활용 고지",
    body: "일부 콘텐츠는 AI 도구의 도움을 받아 초안을 작성하며, 게시 전 에디터가 검토·편집합니다. 오류를 발견하시면 아래 주소로 알려 주세요.",
  },
  {
    title: "6. 문의",
    body: "정정 요청, 개인정보 관련 요청, 사이트 운영 관련 문의는 contact@runmania.kr 로 연락해 주세요.",
  },
];

const Terms = () => {
  usePageMeta({
    title: "이용약관 | 런닝화매니아",
    description:
      "런닝화매니아 이용약관: 교육 목적의 콘텐츠, 제품 정보, 광고·제휴 고지, AI 활용 고지, 문의처를 안내합니다.",
    canonicalPath: "/terms",
    keywords: "런닝화매니아 이용약관, 광고 고지, 제휴 링크",
  });

  return (
    <main className="min-h-screen pt-14">
      <section className="px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-4 flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">이용약관</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold">이용약관</h1>
          <p className="mb-10 text-sm text-muted-foreground">
            최종 업데이트: 2026년 10월 22일
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 text-base font-bold">{section.title}</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Terms;
