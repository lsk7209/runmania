import { useState, useCallback } from "react";
import QuestionFlow from "@/components/QuestionFlow";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ResultPage from "@/components/ResultPage";
import LandingPage from "@/components/LandingPage";
import { diagnose, type UserAnswers } from "@/lib/diagnosisEngine";
import type { DiagnosisResult } from "@/data/shoesDb";
import usePageMeta from "@/hooks/usePageMeta";

type Phase = "intro" | "questions" | "loading" | "result";

const Diagnosis = () => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  usePageMeta({
    title: "러닝화 무료 발 진단 | 3분 맞춤 신발 추천 | 런닝화매니아",
    description: "7개 질문으로 내 발에 맞는 러닝화를 찾아드립니다. 족저근막염, 편평족, 무릎 통증 등 발 상태별 맞춤 러닝화 추천.",
    canonicalPath: "/diagnosis",
    keywords: "러닝화 진단, 발 진단, 맞춤 러닝화, 족저근막염 신발, 편평족 러닝화",
  });

  const handleQuestionsComplete = useCallback((answers: UserAnswers) => {
    const diagnosisResult = diagnose(answers);
    setResult(diagnosisResult);
    setPhase("loading");
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setPhase("result");
  }, []);

  const handleRestart = useCallback(() => {
    setResult(null);
    setPhase("intro");
  }, []);

  return (
    <div className="min-h-screen bg-background pt-14">
      {phase === "intro" && <LandingPage onStart={() => setPhase("questions")} />}
      {phase === "questions" && <QuestionFlow onComplete={handleQuestionsComplete} />}
      {phase === "loading" && <LoadingAnalysis onComplete={handleLoadingComplete} />}
      {phase === "result" && result && <ResultPage result={result} onRestart={handleRestart} />}
    </div>
  );
};

export default Diagnosis;
