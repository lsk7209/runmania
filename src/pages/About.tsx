import { motion } from "framer-motion";
import { Footprints, Target, Shield, Users, BookOpen, Zap } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";
import { useEffect } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const About = () => {
  usePageMeta({
    title: "런닝화매니아 소개 | 러닝화 추천·발 진단 플랫폼",
    description: "런닝화매니아는 한국 러너를 위한 러닝화 추천, 무료 발 진단, 러닝화 리뷰 전문 플랫폼입니다. 발볼·아치·통증 신호를 기반으로 객관적인 신발 추천 정보를 제공합니다.",
    canonicalPath: "/about",
  });

  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "런닝화매니아 소개",
      "url": "https://runmania.kr/about",
      "description": "런닝화매니아는 한국 러너를 위한 러닝화 추천·리뷰·발 진단 전문 플랫폼입니다.",
      "publisher": {
        "@type": "Organization",
        "name": "런닝화매니아",
        "url": "https://runmania.kr",
        "logo": "https://runmania.kr/og-image.png",
      },
    };
    const id = "about-jsonld";
    document.getElementById(id)?.remove();
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return (
    <main className="min-h-screen pt-14">
      <section className="px-4 py-16 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl"
        >
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Footprints className="h-5 w-5" />
            <span className="text-sm font-medium">사이트 소개</span>
          </div>
          <h1 className="text-3xl font-bold mb-4 leading-tight">
            런닝화매니아에 대하여
          </h1>
          <p className="text-muted-foreground leading-7 text-base">
            런닝화매니아는 <strong>한국 러너를 위한 러닝화 추천·리뷰·발 진단 전문 플랫폼</strong>입니다.
            신발 브랜드의 마케팅이 아니라, 발 형태·러닝 목적·체중·통증 이력을 기준으로
            각 러너에게 실제로 맞는 신발을 분석하는 것을 목표로 합니다.
          </p>
        </motion.div>
      </section>

      <section className="px-4 py-14 border-b border-border">
        <div className="mx-auto max-w-3xl">
          <motion.h2 {...fadeUp} transition={{ duration: 0.5 }} className="text-2xl font-bold mb-8">
            운영 원칙
          </motion.h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: <Target className="h-5 w-5 text-primary" />,
                title: "데이터 우선",
                desc: "발볼·아치·체중·주간 거리·러닝 목적·통증 이력을 함께 분석합니다. 단순 순위표가 아니라, 특정 발 조건에서 특정 신발이 왜 맞거나 맞지 않는지를 설명합니다.",
              },
              {
                icon: <Shield className="h-5 w-5 text-primary" />,
                title: "광고 독립성",
                desc: "사이트에 광고가 표시될 수 있으나, 추천 순위는 광고 수익과 무관하게 발 특성·러닝 목적 기준으로 결정됩니다. 광고가 포함된 경우 독자가 확인할 수 있도록 표시합니다.",
              },
              {
                icon: <Users className="h-5 w-5 text-primary" />,
                title: "실용성 중심",
                desc: "러닝화 초보부터 마라톤 완주를 목표로 하는 러너까지 다양한 수준을 고려합니다. 불필요하게 복잡한 전문용어보다 실제 착화 판단에 도움이 되는 기준을 우선합니다.",
              },
              {
                icon: <BookOpen className="h-5 w-5 text-primary" />,
                title: "정보 정확성",
                desc: "신발 스펙(무게·드롭·쿠셔닝)은 제조사 공개 데이터를 기준으로 합니다. 의료적 판단(통증 진단·처방)은 전문가 상담을 권장하며, 이 사이트는 의료 정보를 대체하지 않습니다.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-6">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 border-b border-border">
        <div className="mx-auto max-w-3xl">
          <motion.h2 {...fadeUp} transition={{ duration: 0.5 }} className="text-2xl font-bold mb-6">
            제공 서비스
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Zap className="h-5 w-5" />,
                title: "무료 발 진단",
                desc: "7문항으로 발 유형·통증·러닝 목적을 분석, 맞는 신발과 피해야 할 신발을 제시합니다.",
              },
              {
                icon: <BookOpen className="h-5 w-5" />,
                title: "러닝화 리뷰",
                desc: "국내 유통 주요 모델의 장단점, 추천 대상, 착화감을 정리합니다.",
              },
              {
                icon: <Target className="h-5 w-5" />,
                title: "러닝 도구",
                desc: "페이스 계산기, 사이즈 변환기, 칼로리 계산기, 훈련 페이스 등 실용 도구를 제공합니다.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-2 text-primary">{item.icon}</div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-5">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-bold mb-4">연락처</h2>
            <p className="text-muted-foreground text-sm leading-7">
              콘텐츠 오류, 제휴 문의, 신발 정보 수정 요청은 아래 주소로 연락해 주세요.
            </p>
            <p className="mt-3 text-sm font-medium text-primary">
              이메일: contact@runmania.kr
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              © {new Date().getFullYear()} 런닝화매니아. 러닝화 추천 · 발 진단 플랫폼.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default About;
