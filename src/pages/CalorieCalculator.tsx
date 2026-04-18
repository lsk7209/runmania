import { useState } from "react";
import { motion } from "framer-motion";
import usePageMeta from "@/hooks/usePageMeta";

const CalorieCalculator = () => {
  usePageMeta({
    title: "달리기 칼로리 계산기 | 런닝화매니아",
    description:
      "체중, 달리기 속도, 시간을 입력하면 정확한 칼로리 소모량을 계산합니다. METs 기반 공식 적용.",
    canonicalPath: "/tools/calorie-calculator",
    keywords: "달리기 칼로리, 러닝 칼로리 계산, 조깅 칼로리 소모",
  });

  const [weight, setWeight] = useState(65);
  const [pace, setPace] = useState(6.0);
  const [duration, setDuration] = useState(30);
  const [result, setResult] = useState<null | {
    calories: number;
    distance: number;
  }>(null);

  // MET 값: 페이스별 (min/km → km/h → MET)
  const getMet = (paceMinKm: number) => {
    const speedKmh = 60 / paceMinKm;
    if (speedKmh < 8) return 8.3;
    if (speedKmh < 9.7) return 9.8;
    if (speedKmh < 11.3) return 11.0;
    if (speedKmh < 12.9) return 11.8;
    return 14.5;
  };

  const calculate = () => {
    const speedKmh = 60 / pace;
    const met = getMet(pace);
    const hours = duration / 60;
    const calories = met * weight * hours;
    const distance = speedKmh * hours;
    setResult({
      calories: Math.round(calories),
      distance: Math.round(distance * 10) / 10,
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
            달리기 칼로리 계산기
          </h1>
          <p className="mb-8 text-muted-foreground">
            체중·페이스·시간으로 소모 칼로리를 계산합니다
          </p>

          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                체중 (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                min={30}
                max={200}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                달리기 페이스 (분/km)
              </label>
              <input
                type="number"
                value={pace}
                onChange={(e) => setPace(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                min={4}
                max={12}
                step={0.5}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                예: 6.0 = 1km당 6분
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                달리기 시간 (분)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                min={5}
                max={300}
              />
            </div>
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
              className="mt-6 grid grid-cols-2 gap-4"
            >
              <div className="rounded-2xl border border-border bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">소모 칼로리</p>
                <p className="mt-1 text-4xl font-bold text-primary">
                  {result.calories}
                </p>
                <p className="text-sm text-muted-foreground">kcal</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">달린 거리</p>
                <p className="mt-1 text-4xl font-bold text-emerald-500">
                  {result.distance}
                </p>
                <p className="text-sm text-muted-foreground">km</p>
              </div>
            </motion.div>
          )}

          <div className="mt-8 rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">계산 방식</p>
            <p className="mt-1">
              MET(대사당량) × 체중(kg) × 시간(h) 공식 사용. 개인차(심폐 능력,
              지형, 기온)에 따라 ±15% 오차가 있을 수 있습니다.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalorieCalculator;
