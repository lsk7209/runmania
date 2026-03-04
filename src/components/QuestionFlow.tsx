import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CreditCard, Footprints, Activity, Weight, Zap, AlertTriangle, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { UserAnswers } from "@/lib/diagnosisEngine";

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
    subtitle: "가장 최근에 신은 러닝화 브랜드를 선택하세요",
    options: [
      { value: "nike", label: "나이키", description: "좁은 편" },
      { value: "adidas", label: "아디다스", description: "좁은/표준" },
      { value: "newbalance", label: "뉴발란스", description: "넓은 편" },
      { value: "asics", label: "아식스", description: "표준/넓은" },
    ],
    answerKey: "q1Brand",
  },
  {
    id: "q2",
    icon: <CreditCard className="h-5 w-5" />,
    question: "신용카드를 발바닥 가장 넓은 곳에 대보세요.",
    subtitle: "카드 너비(약 54mm)를 발볼에 대고 비교하세요",
    options: [
      { value: "narrow", label: "카드가 발볼을 덮거나 남는다", description: "좁은 발" },
      { value: "standard", label: "발볼이 카드 밖으로 살짝 나온다", description: "표준" },
      { value: "wide", label: "발볼이 카드보다 훨씬 넓다", description: "넓은 발 (4E)" },
    ],
    answerKey: "q2Width",
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

const nikeSubQuestion: QuestionDef = {
  id: "q1sub",
  icon: <Footprints className="h-5 w-5" />,
  question: "나이키를 신었을 때 느낌이 어땠나요?",
  options: [
    { value: "pinky-pain", label: "새끼발가락이 아팠다", description: "→ 넓은 발 가능성" },
    { value: "loose", label: "헐렁했다", description: "→ 좁은 발 가능성" },
    { value: "fine", label: "괜찮았다", description: "→ 표준" },
  ],
  answerKey: "q1SubFeeling",
};

const QuestionFlow = ({ onComplete }: QuestionFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showNikeSub, setShowNikeSub] = useState(false);
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [direction, setDirection] = useState(1);

  const totalSteps = 7;
  const currentQuestion = showNikeSub ? nikeSubQuestion : questions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleSelect = (value: string) => {
    const key = currentQuestion.answerKey;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    // Nike sub-question logic
    if (currentStep === 0 && value === "nike" && !showNikeSub) {
      setTimeout(() => {
        setDirection(1);
        setShowNikeSub(true);
      }, 200);
      return;
    }

    // Move to next
    setTimeout(() => {
      if (showNikeSub) {
        setShowNikeSub(false);
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

  const handleBack = () => {
    if (showNikeSub) {
      setShowNikeSub(false);
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
        {(currentStep > 0 || showNikeSub) && (
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

            {/* Credit card visual for Q2 */}
            {currentQuestion.id === "q2" && (
              <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                  {/* Foot outline */}
                  <div className="h-32 w-24 rounded-[40%_40%_30%_30%] border-2 border-dashed border-muted-foreground/30" />
                  {/* Card overlay */}
                  <div className="absolute left-1/2 top-1/2 h-12 w-[54px] -translate-x-1/2 -translate-y-1/2 rounded border border-primary/50 bg-primary/10 text-[8px] flex items-center justify-center text-primary/60">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Options */}
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionFlow;
