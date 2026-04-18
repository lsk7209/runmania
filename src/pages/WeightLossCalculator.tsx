import { useState } from "react";
import { motion } from "framer-motion";
import usePageMeta from "@/hooks/usePageMeta";

const WeightLossCalculator = () => {
  usePageMeta({
    title: "달리기 체중 감량 계산기 | 런닝화매니아",
    description:
      "목표 체중까지 달리기로 얼마나 걸릴지 계산합니다. 주간 달리기 습관과 식이 조절을 고려한 현실적 예측.",
    canonicalPath: "/tools/weight-loss",
    keywords: "달리기 다이어트, 러닝 체중 감량, 달리기로 살빼기",
  });

  const [currentWeight, setCurrentWeight] = useState(75);
  const [targetWeight, setTargetWeight] = useState(70);
  const [pace, setPace] = useState(6.5);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [minsPerSession, setMinsPerSession] = useState(40);
  const [result, setResult] = useState<null | {
    weeklyCalories: number;
    weeklyFatLoss: number;
    weeksNeeded: number;
  }>(null);

  const calculate = () => {
    const speedKmh = 60 / pace;
    // MET 계산
    let met = 8.3;
    if (speedKmh >= 9.7) met = 9.8;
    if (speedKmh >= 11.3) met = 11.0;
    if (speedKmh >= 12.9) met = 11.8;

    const hoursPerSession = minsPerSession / 60;
    const calPerSession = met * currentWeight * hoursPerSession;
    const weeklyCalories = calPerSession * daysPerWeek;
    // 체지방 1kg = 7700kcal
    const weeklyFatLoss = weeklyCalories / 7700;
    const totalFatToLose = currentWeight - targetWeight;
    const weeksNeeded =
      totalFatToLose > 0 ? Math.ceil(totalFatToLose / weeklyFatLoss) : 0;

    setResult({
      weeklyCalories: Math.round(weeklyCalories),
      weeklyFatLoss: Math.round(weeklyFatLoss * 100) / 100,
      weeksNeeded,
    });
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            달리기 체중 감량 계산기
          </h1>
          <p className="mb-8 text-muted-foreground">
            목표 체중까지 달리기만으로 얼마나 걸릴지 계산합니다
          </p>

          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            {[
              {
                label: "현재 체중 (kg)",
                val: currentWeight,
                set: setCurrentWeight,
                min: 40,
                max: 200,
              },
              {
                label: "목표 체중 (kg)",
                val: targetWeight,
                set: setTargetWeight,
                min: 40,
                max: 200,
              },
              {
                label: "달리기 페이스 (분/km)",
                val: pace,
                set: setPace,
                min: 4,
                max: 12,
                step: 0.5,
              },
              {
                label: "주간 달리기 횟수 (회)",
                val: daysPerWeek,
                set: setDaysPerWeek,
                min: 1,
                max: 7,
              },
              {
                label: "1회 달리기 시간 (분)",
                val: minsPerSession,
                set: setMinsPerSession,
                min: 10,
                max: 180,
              },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {f.label}
                </label>
                <input
                  type="number"
                  value={f.val}
                  onChange={(e) => f.set(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                  min={f.min}
                  max={f.max}
                  step={"step" in f ? f.step : 1}
                />
              </div>
            ))}
            <button
              onClick={calculate}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              계산하기
            </button>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 space-y-4"
            >
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "주간 소모 칼로리",
                    value: `${result.weeklyCalories}kcal`,
                    color: "text-primary",
                  },
                  {
                    label: "주간 체지방 감소",
                    value: `${result.weeklyFatLoss}kg`,
                    color: "text-emerald-500",
                  },
                  {
                    label: "목표까지 예상",
                    value: `${result.weeksNeeded}주`,
                    color: "text-orange-500",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-card p-4 text-center"
                  >
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className={`mt-1 text-xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-secondary/30 p-4 text-sm text-muted-foreground">
                <strong className="text-foreground">⚠️ 주의</strong>:
                달리기만으로 체중 감량 시 근손실 위험이 있습니다. 식이 조절(일일
                500kcal 적자)을 병행하면 절반의 기간에 달성 가능합니다.
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WeightLossCalculator;
