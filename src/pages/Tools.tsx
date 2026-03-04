import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wrench, Calculator, Ruler, ArrowRight } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const utilities = [
  {
    title: "페이스 계산기",
    description: "러닝 중 완주 시간을 예측하거나, 목표 완주 시간에 필요한 러닝 페이스를 계산합니다.",
    icon: <Calculator className="h-6 w-6" />,
    path: "/tools/pace-calculator",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-500",
    border: "group-hover:border-blue-500/50",
    bgIcon: "bg-blue-500/10",
  },
  {
    title: "사이즈 변환",
    description: "한국(mm), US, EU, UK 등 전 세계 러닝화 사이즈를 간편하게 상호 변환합니다.",
    icon: <Ruler className="h-6 w-6" />,
    path: "/tools/size-converter",
    color: "from-primary/20 to-purple-500/20 text-primary",
    border: "group-hover:border-primary/50",
    bgIcon: "bg-primary/10",
  },
];

const Tools = () => {
  usePageMeta({
    title: "러닝 유틸리티 | 런닝화매니아",
    description: "러닝 페이스 계산기, 신발 사이즈 변환기 등 러너를 위한 다양한 필수 도구를 제공합니다.",
    canonicalPath: "/tools",
    keywords: "러닝 유틸리티, 페이스 계산기, 사이즈 변환기",
  });

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary shadow-sm">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              러닝 유틸리티
            </h1>
            <p className="text-base text-muted-foreground">러너를 위한 필수 도구 모음</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {utilities.map((util, index) => (
              <motion.div
                key={util.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={util.path} className="group block h-full">
                  <div className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md ${util.border}`}>
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                    <div className="mb-6 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${util.bgIcon} ${util.color.split(" ").pop()}`}>
                        {util.icon}
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {util.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {util.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Tools;
