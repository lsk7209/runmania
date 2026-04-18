import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Wrench,
  Calculator,
  Ruler,
  ArrowRight,
  Footprints,
  Flame,
  Heart,
  Trophy,
  Gauge,
  Scale,
} from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const utilities = [
  {
    title: "발 진단",
    description:
      "간단한 질문을 통해 나의 발 유형(평발, 요족 등)을 진단하고 적합한 러닝화 유형을 추천받습니다.",
    icon: <Footprints className="h-6 w-6" />,
    path: "/tools/diagnosis",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
    border: "group-hover:border-emerald-500/50",
    bgIcon: "bg-emerald-500/10",
  },
  {
    title: "페이스 계산기",
    description:
      "러닝 중 완주 시간을 예측하거나, 목표 완주 시간에 필요한 러닝 페이스를 계산합니다.",
    icon: <Calculator className="h-6 w-6" />,
    path: "/tools/pace-calculator",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-500",
    border: "group-hover:border-blue-500/50",
    bgIcon: "bg-blue-500/10",
  },
  {
    title: "사이즈 변환",
    description:
      "한국(mm), US, EU, UK 등 전 세계 러닝화 사이즈를 간편하게 상호 변환합니다.",
    icon: <Ruler className="h-6 w-6" />,
    path: "/tools/size-converter",
    color: "from-primary/20 to-purple-500/20 text-primary",
    border: "group-hover:border-primary/50",
    bgIcon: "bg-primary/10",
  },
  {
    title: "칼로리 계산기",
    description:
      "체중·페이스·시간을 입력하면 달리기 소모 칼로리를 METs 공식으로 계산합니다.",
    icon: <Flame className="h-6 w-6" />,
    path: "/tools/calorie-calculator",
    color: "from-orange-500/20 to-red-500/20 text-orange-500",
    border: "group-hover:border-orange-500/50",
    bgIcon: "bg-orange-500/10",
  },
  {
    title: "심박수 구간 계산기",
    description:
      "나이와 안정시 심박수로 Z1~Z5 훈련 심박수 구간을 Karvonen 공식으로 계산합니다.",
    icon: <Heart className="h-6 w-6" />,
    path: "/tools/heart-rate-zones",
    color: "from-rose-500/20 to-pink-500/20 text-rose-500",
    border: "group-hover:border-rose-500/50",
    bgIcon: "bg-rose-500/10",
  },
  {
    title: "완주 시간 예측기",
    description:
      "최근 달리기 기록으로 5km·하프·풀마라톤 예상 완주 시간을 Riegel 공식으로 예측합니다.",
    icon: <Trophy className="h-6 w-6" />,
    path: "/tools/race-predictor",
    color: "from-yellow-500/20 to-amber-500/20 text-yellow-600",
    border: "group-hover:border-yellow-500/50",
    bgIcon: "bg-yellow-500/10",
  },
  {
    title: "훈련 페이스 계산기",
    description:
      "레이스 기록 기반으로 쉬운 조깅·템포런·인터벌 등 5가지 훈련 구간 페이스를 계산합니다.",
    icon: <Gauge className="h-6 w-6" />,
    path: "/tools/training-paces",
    color: "from-indigo-500/20 to-violet-500/20 text-indigo-500",
    border: "group-hover:border-indigo-500/50",
    bgIcon: "bg-indigo-500/10",
  },
  {
    title: "체중 감량 계산기",
    description:
      "주간 달리기 습관으로 목표 체중까지 얼마나 걸리는지 현실적으로 계산합니다.",
    icon: <Scale className="h-6 w-6" />,
    path: "/tools/weight-loss",
    color: "from-teal-500/20 to-cyan-500/20 text-teal-500",
    border: "group-hover:border-teal-500/50",
    bgIcon: "bg-teal-500/10",
  },
];

const Tools = () => {
  usePageMeta({
    title: "러닝 유틸리티 | 런닝화매니아",
    description:
      "러닝 페이스 계산기, 신발 사이즈 변환기 등 러너를 위한 다양한 필수 도구를 제공합니다.",
    canonicalPath: "/tools",
    keywords: "러닝 유틸리티, 페이스 계산기, 사이즈 변환기",
  });

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary shadow-sm">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              러닝 유틸리티
            </h1>
            <p className="text-base text-muted-foreground">
              러너를 위한 필수 도구 모음
            </p>
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
                  <div
                    className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md ${util.border}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                    <div className="mb-6 flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${util.bgIcon} ${util.color.split(" ").pop()}`}
                      >
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
