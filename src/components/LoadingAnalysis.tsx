import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingAnalysisProps {
  onComplete: () => void;
}

const messages = [
  "발 데이터 분석 중...",
  "나이키 페가수스 41 제외 여부 판단 중...",
  "아식스 젤카야노 30 스펙 대조 중...",
  "뉴발란스 프레시폼 1080 적합도 계산 중...",
  "브룩스 아드레날린 GTS 23 비교 중...",
  "쿠셔닝 밀도 & 안정성 지수 계산 중...",
  "최적의 처방을 도출합니다.",
];

const LoadingAnalysis = ({ onComplete }: LoadingAnalysisProps) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => {
        if (i >= messages.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return i;
        }
        return i + 1;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Pulsing ring */}
      <div className="relative mb-10">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-primary"
          style={{ width: 80, height: 80, top: -10, left: -10 }}
        />
        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-border bg-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>

      {/* Cycling text */}
      <div className="h-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center text-sm font-medium text-primary"
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex gap-1.5">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              i <= msgIndex ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingAnalysis;
