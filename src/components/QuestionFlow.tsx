import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Ruler, Footprints, Activity, Weight, Zap, AlertTriangle, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FootMeasurementStep from "@/components/FootMeasurementStep";
import type { FitFeeling, UserAnswers } from "@/lib/diagnosisEngine";

interface QuestionFlowProps {
  onComplete: (answers: UserAnswers) => void;
}

type PartialAnswers = Partial<UserAnswers>;

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface QuestionDef {
  id: string;
  icon: React.ReactNode;
  question: string;
  subtitle?: string;
  options: Option[];
  answerKey: keyof UserAnswers;
}

const questions: QuestionDef[] = [
  {
    id: "q1",
    icon: <Footprints className="h-5 w-5" />,
    question: "현재 신고 있거나 신어본 브랜드는?",
    subtitle: "가장 최근에 신은 러닝화 브랜드를 선택하세요. 브랜드별 폭 설명은 모델마다 달라 참고용입니다",
    options: [
      { value: "nike", label: "나이키" },
      { value: "adidas", label: "아디다스" },
      { value: "newbalance", label: "뉴발란스" },
      { value: "asics", label: "아식스" },
      { value: "other", label: "기타 브랜드" },
      { value: "first", label: "첫 구매 (러닝화 경험 없음)" },
      { value: "unknown", label: "잘 모르겠음" },
    ],
    answerKey: "q1Brand",
  },
  {
    id: "q2",
    icon: <Ruler className="h-5 w-5" />,
    question: "발 길이와 가장 넓은 폭을 알고 있나요?",
    subtitle: "선택 입력입니다. 모르면 건너뛰어도 추천을 받을 수 있어요",
    options: [],
    answerKey: "footLengthMm",
  },
  {
    id: "q3",
    icon: <Activity className="h-5 w-5" />,
    question: "젖은 발로 방바닥을 딛었을 때 내 발자국은?",
    subtitle: "아치 높이를 확인합니다",
    options: [
      { value: "high", label: "중간이 끊겨 있다", description: "하이 아치 / 과외전" },
      { value: "normal", label: "적당히 이어져 있다", description: "정상" },
      { value: "flat", label: "발바닥 전체가 찍힌다", description: "편평족 / 과내전" },
    ],
    answerKey: "q3Arch",
  },
  {
    id: "q4",
    icon: <Weight className="h-5 w-5" />,
    question: "현재 체중이나 체격 조건은?",
    options: [
      { value: "light", label: "가벼운 편" },
      { value: "normal", label: "보통" },
      { value: "heavy", label: "체격이 있거나 과체중" },
    ],
    answerKey: "q4Weight",
  },
  {
    id: "q5",
    icon: <Zap className="h-5 w-5" />,
    question: "현재 러닝 수준과 목표는?",
    options: [
      { value: "beginner", label: "입문 / 다이어트", description: "시작 단계" },
      { value: "intermediate", label: "취미 러너", description: "주 2-3회" },
      { value: "advanced", label: "기록 단축 / 대회", description: "퍼포먼스" },
    ],
    answerKey: "q5Level",
  },
  {
    id: "q6",
    icon: <AlertTriangle className="h-5 w-5" />,
    question: "러닝 후 통증이 있거나 걱정되는 부위는?",
    options: [
      { value: "knee", label: "무릎" },
      { value: "ankle", label: "발목 안쪽" },
      { value: "sole", label: "발바닥 / 족저근막" },
      { value: "none", label: "없음" },
    ],
    answerKey: "q6Pain",
  },
  {
    id: "q7",
    icon: <Cloud className="h-5 w-5" />,
    question: "선호하는 쿠션 느낌은?",
    options: [
      { value: "soft", label: "물렁하고 푹신함", description: "소프트 쿠션" },
      { value: "bouncy", label: "탱탱하고 반발력 있음", description: "반발력 / 펌" },
    ],
    answerKey: "q7Cushion",
  },
];

const FIT_OPTIONS: { value: FitFeeling; label: string; description?: string }[] = [
  { value: "forefoot-tight", label: "앞볼·새끼발가락이 눌렸다" },
  { value: "instep-tight", label: "발등이 조였다" },
  { value: "heel-slip", label: "뒤꿈치가 들렸다" },
  { value: "loose", label: "전체적으로 헐렁했다" },
  { value: "fine", label: "괜찮았다" },
  { value: "unknown", label: "잘 모르겠다" },
];

const fitQuestion: QuestionDef = {
  id: "q1sub",
  icon: <Footprints className="h-5 w-5" />,
  question: "그 신발을 신었을 때 가장 크게 느낀 점은?",
  subtitle: "사이즈·폭 옵션까지 기억나면 더 좋지만, 느낌만으로도 충분해요",
  options: FIT_OPTIONS,
  answerKey: "q2Fit",
};

/** 러닝화 경험이 없거나 기억나지 않으면 착용 경험 질문은 건너뛴다 */
const NO_FIT_HISTORY_BRANDS = ["first", "unknown"];

const QuestionFlow = ({ onComplete }: QuestionFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFitSub, setShowFitSub] = useState(false);
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [direction, setDirection] = useState(1);

  const totalSteps = 7;
  const currentQuestion = showFitSub ? fitQuestion : questions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleSelect = (value: string) => {
    const key = currentQuestion.answerKey;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    // 브랜드 선택 후 착용 경험 질문
    if (currentStep === 0 && !showFitSub && !NO_FIT_HISTORY_BRANDS.includes(value)) {
      setTimeout(() => {
        setDirection(1);
        setShowFitSub(true);
      }, 200);
      return;
    }

    advance(newAnswers);
  };

  const advance = (newAnswers: PartialAnswers) => {
    setTimeout(() => {
      if (showFitSub) {
        setShowFitSub(false);
        setDirection(1);
        setCurrentStep(1);
        return;
      }

      if (currentStep < questions.length - 1) {
        setDirection(1);
        setCurrentStep((s) => s + 1);
      } else {
        onComplete(newAnswers as UserAnswers);
      }
    }, 300);
  };

  const handleMeasurement = (lengthMm?: number, widthMm?: number) => {
    const newAnswers = { ...answers, footLengthMm: lengthMm, footWidthMm: widthMm };
    setAnswers(newAnswers);
    advance(newAnswers);
  };

  const handleBack = () => {
    if (showFitSub) {
      setShowFitSub(false);
      return;
    }
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>STEP {currentStep + 1} / {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="mb-8 h-1.5 bg-secondary [&>div]:bg-primary" />

        {/* Back button */}
        {(currentStep > 0 || showFitSub) && (
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            이전
          </button>
        )}

        {/* Question */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Question header */}
            <div className="mb-8">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                {currentQuestion.icon}
              </div>
              <h2 className="mb-2 text-xl font-bold sm:text-2xl">
                {currentQuestion.question}
              </h2>
              {currentQuestion.subtitle && (
                <p className="text-sm text-muted-foreground">{currentQuestion.subtitle}</p>
              )}
            </div>

            {/* Options */}
            {currentQuestion.id === "q2" ? (
              <FootMeasurementStep onSubmit={handleMeasurement} />
            ) : (
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.answerKey] === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full rounded-xl border p-5 text-left transition-all active:bg-primary/10 ${
                      isSelected
                        ? "border-primary bg-primary/10 neon-border"
                        : "border-border bg-card hover:border-primary/30 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{opt.label}</span>
                        {opt.description && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        )}
                      </div>
                      <ArrowRight className={`h-4 w-4 transition-opacity ${isSelected ? "text-primary opacity-100" : "opacity-0"}`} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionFlow;
