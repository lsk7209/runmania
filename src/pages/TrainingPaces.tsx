import { useState } from "react";
import { motion } from "framer-motion";
import usePageMeta from "@/hooks/usePageMeta";

function secToMmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const PACE_TYPES = [
  {
    name: "쉬운 조깅 (Easy)",
    factor: 1.3,
    desc: "회복·일상 훈련. 대화 가능 속도",
  },
  { name: "마라톤 페이스 (MP)", factor: 1.1, desc: "목표 마라톤 완주 페이스" },
  {
    name: "역치 페이스 (Tempo)",
    factor: 1.05,
    desc: "불편하지만 유지 가능한 20~40분 페이스",
  },
  { name: "인터벌 페이스", factor: 0.95, desc: "고강도 반복 훈련 페이스" },
  {
    name: "반복 페이스 (Repetition)",
    factor: 0.88,
    desc: "짧은 전력질주 훈련 (400m 이하)",
  },
];

const TrainingPaces = () => {
  usePageMeta({
    title: "훈련 페이스 계산기 | 런닝화매니아",
    description:
      "레이스 기록을 입력하면 쉬운 조깅·템포런·인터벌 등 5가지 훈련 페이스를 계산합니다. Jack Daniels 공식.",
    canonicalPath: "/tools/training-paces",
    keywords: "훈련 페이스 계산, 인터벌 페이스, 템포런 페이스, 달리기 훈련",
  });

  const [dist, setDist] = useState(10);
  const [h, setH] = useState(0);
  const [m, setM] = useState(55);
  const [s, setS] = useState(0);
  const [paces, setPaces] = useState<
    { name: string; pace: string; desc: string }[] | null
  >(null);

  const calculate = () => {
    const totalSec = h * 3600 + m * 60 + s;
    if (totalSec === 0 || dist === 0) return;
    const basePaceSec = totalSec / dist;
    const result = PACE_TYPES.map((pt) => ({
      name: pt.name,
      pace: secToMmss(basePaceSec * pt.factor) + "/km",
      desc: pt.desc,
    }));
    setPaces(result);
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            훈련 페이스 계산기
          </h1>
          <p className="mb-8 text-muted-foreground">
            레이스 기록으로 5가지 훈련 구간 페이스를 계산합니다
          </p>

          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                기준 레이스 거리 (km)
              </label>
              <select
                value={dist}
                onChange={(e) => setDist(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              >
                <option value={5}>5km</option>
                <option value={10}>10km</option>
                <option value={21.0975}>하프마라톤</option>
                <option value={42.195}>풀마라톤</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                기준 레이스 기록
              </label>
              <div className="flex gap-2">
                {[
                  { val: h, set: setH, label: "시간", max: 9 },
                  { val: m, set: setM, label: "분", max: 59 },
                  { val: s, set: setS, label: "초", max: 59 },
                ].map((f) => (
                  <div key={f.label} className="flex-1">
                    <input
                      type="number"
                      value={f.val}
                      onChange={(e) => f.set(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-center"
                      min={0}
                      max={f.max}
                    />
                    <p className="mt-1 text-center text-xs text-muted-foreground">
                      {f.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={calculate}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              계산하기
            </button>
          </div>

          {paces && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-3"
            >
              {paces.map((p) => (
                <div
                  key={p.name}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {p.name}
                    </span>
                    <span className="font-bold text-primary">{p.pace}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrainingPaces;
