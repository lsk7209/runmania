import { useState } from "react";
import { motion } from "framer-motion";
import usePageMeta from "@/hooks/usePageMeta";

const ZONES = [
  {
    name: "Z1 회복",
    pct: [50, 60],
    color: "bg-blue-400",
    desc: "가벼운 워밍업·쿨다운",
  },
  {
    name: "Z2 지방 연소",
    pct: [60, 70],
    color: "bg-green-400",
    desc: "장거리 기초체력·지방 연소",
  },
  {
    name: "Z3 유산소",
    pct: [70, 80],
    color: "bg-yellow-400",
    desc: "레이스 페이스·유산소 강화",
  },
  {
    name: "Z4 무산소",
    pct: [80, 90],
    color: "bg-orange-400",
    desc: "인터벌·LT 향상",
  },
  {
    name: "Z5 최대",
    pct: [90, 100],
    color: "bg-red-500",
    desc: "전력 질주·VO2max",
  },
];

const HeartRateZones = () => {
  usePageMeta({
    title: "심박수 훈련 구간 계산기 | 런닝화매니아",
    description:
      "나이·안정시 심박수로 5가지 훈련 심박수 구간(Z1~Z5)을 계산합니다. Karvonen 공식 적용.",
    canonicalPath: "/tools/heart-rate-zones",
    keywords: "심박수 훈련 구간, 러닝 심박수 계산, 최대심박수 계산",
  });

  const [age, setAge] = useState(35);
  const [restHr, setRestHr] = useState(60);
  const [zones, setZones] = useState<
    | { name: string; low: number; high: number; color: string; desc: string }[]
    | null
  >(null);

  const calculate = () => {
    const maxHr = 220 - age;
    const hrReserve = maxHr - restHr;
    const result = ZONES.map((z) => ({
      name: z.name,
      color: z.color,
      desc: z.desc,
      low: Math.round(restHr + hrReserve * (z.pct[0] / 100)),
      high: Math.round(restHr + hrReserve * (z.pct[1] / 100)),
    }));
    setZones(result);
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            심박수 훈련 구간 계산기
          </h1>
          <p className="mb-8 text-muted-foreground">
            Karvonen 공식으로 5가지 훈련 구간을 계산합니다
          </p>

          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                나이 (세)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                min={15}
                max={80}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                안정시 심박수 (bpm)
              </label>
              <input
                type="number"
                value={restHr}
                onChange={(e) => setRestHr(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                min={40}
                max={100}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                아침 기상 직후 측정값. 모르면 60 사용
              </p>
            </div>
            <button
              onClick={calculate}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              계산하기
            </button>
          </div>

          {zones && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-3"
            >
              <p className="text-sm text-muted-foreground">
                추정 최대 심박수:{" "}
                <strong className="text-foreground">{220 - age} bpm</strong>
              </p>
              {zones.map((z) => (
                <div
                  key={z.name}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${z.color}`} />
                      <span className="font-medium text-foreground">
                        {z.name}
                      </span>
                    </div>
                    <span className="font-bold text-foreground">
                      {z.low} – {z.high} bpm
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground pl-5">
                    {z.desc}
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

export default HeartRateZones;
