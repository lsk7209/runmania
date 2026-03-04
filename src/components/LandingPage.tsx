import { motion } from "framer-motion";
import { Footprints, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Scan line effect */}
      <div className="scan-line pointer-events-none absolute inset-0 z-0" />

      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(160 84% 39%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 39%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-secondary"
        >
          <Footprints className="h-10 w-10 text-primary" />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs text-muted-foreground"
        >
          <Activity className="h-3 w-3 text-primary" />
          FOOT ANALYSIS LAB v2.0
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
        >
          당신의 족저근막염은
          <br />
          <span className="neon-text text-primary">'신발'</span> 때문일 수 있습니다.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mx-auto mb-10 max-w-md text-base text-muted-foreground sm:text-lg"
        >
          3분 만에 내 발 모양을 정밀 진단하고,
          <br />
          절대 신으면 안 되는 신발을 걸러내세요.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="group gap-2 rounded-xl bg-primary px-8 py-6 text-base font-semibold text-primary-foreground neon-border transition-all hover:neon-border-strong"
          >
            진단 시작하기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-6 text-xs text-muted-foreground"
        >
          7개 질문 · 약 3분 소요 · 개인정보 수집 없음
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LandingPage;
