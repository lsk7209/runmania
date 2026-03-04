import { useState, useCallback } from "react";
import LandingPage from "@/components/LandingPage";
import QuestionFlow from "@/components/QuestionFlow";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ResultPage from "@/components/ResultPage";
import { diagnose, type UserAnswers } from "@/lib/diagnosisEngine";
import type { DiagnosisResult } from "@/data/shoesDb";

type AppPhase = "landing" | "questions" | "loading" | "result";

const Index = () => {
  const [phase, setPhase] = useState<AppPhase>("landing");
  const [result, setResult] = useState<DiagnosisResult | null>(null);

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
    setPhase("landing");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {phase === "landing" && <LandingPage onStart={() => setPhase("questions")} />}
      {phase === "questions" && <QuestionFlow onComplete={handleQuestionsComplete} />}
      {phase === "loading" && <LoadingAnalysis onComplete={handleLoadingComplete} />}
      {phase === "result" && result && <ResultPage result={result} onRestart={handleRestart} />}
    </div>
  );
};

export default Index;
