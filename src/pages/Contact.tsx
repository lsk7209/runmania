import { motion } from "framer-motion";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const Contact = () => {
  usePageMeta({
    title: "문의하기 | 런닝화매니아",
    description:
      "런닝화매니아에 콘텐츠 오류 제보, 제휴 문의, 개인정보 관련 요청, 러닝화 추천 피드백을 보내실 수 있습니다.",
    canonicalPath: "/contact",
    keywords: "런닝화매니아 문의, 러닝화 추천 문의, contact@runmania.kr",
  });

  return (
    <main className="min-h-screen pt-14">
      <section className="border-b border-border px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-4 flex items-center gap-2 text-primary">
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">문의</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold">문의하기</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            런닝화매니아는 러너를 위한 러닝화 가이드, 리뷰 요약, 무료 계산기를
            제공합니다. 콘텐츠 오류 제보, 광고·제휴 문의, 개인정보 관련 요청,
            사이트에 대한 의견은 이 페이지를 통해 보내 주세요.
          </p>
        </motion.div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-6">
            <Mail className="mb-3 h-5 w-5 text-primary" />
            <h2 className="mb-2 text-base font-bold">이메일</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              문의는 아래 주소로 보내 주세요:{" "}
              <a
                href="mailto:contact@runmania.kr"
                className="font-medium text-primary hover:underline"
              >
                contact@runmania.kr
              </a>
              . 정보의 정확성, 제품 데이터, 제휴 고지, 개인정보와 관련된 내용을
              우선 확인하며, 영업일 기준 3일 이내 답변을 드리는 것을 목표로 합니다.
            </p>
          </article>

          <article className="rounded-xl border border-border bg-card p-6">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            <h2 className="mb-2 text-base font-bold">답변 범위</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              런닝화매니아는 의학적 진단이나 개인별 부상 치료를 제공하지 않습니다.
              러닝 중 통증이 계속되면 정형외과·스포츠의학 전문가와 상담하세요.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default Contact;
