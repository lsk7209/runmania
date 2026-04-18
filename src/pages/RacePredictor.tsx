import { useState } from "react";
import { motion } from "framer-motion";
import usePageMeta from "@/hooks/usePageMeta";

const RACES = [
  { name: "5km", dist: 5 },
  { name: "10km", dist: 10 },
  { name: "하프마라톤", dist: 21.0975 },
  { name: "풀마라톤", dist: 42.195 },
];

function riegelPredict(
  refTimeSec: number,
  refDist: number,
  targetDist: number,
) {
  return refTimeSec * Math.pow(targetDist / refDist, 1.06);
}

function secToHms(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  return `${m}분 ${s}초`;
}

const RacePredictor = () => {
  usePageMeta({
    title: "마라톤 완주 시간 예측기 | 런닝화매니아",
    description:
      "최근 달리기 기록을 입력하면 5km·10km·하프·풀마라톤 예상 완주 시간을 계산합니다. Riegel 공식 사용.",
    canonicalPath: "/tools/race-predictor",
    keywords: "마라톤 완주 예측, 서브4 가능 계산, 하프마라톤 예측",
  });

  const [refDist, setRefDist] = useState(10);
  const [refH, setRefH] = useState(0);
  const [refM, setRefM] = useState(55);
  const [refS, setRefS] = useState(0);
  const [predictions, setPredictions] = useState<
    { name: string; time: string; pace: string }[] | null
  >(null);

  const calculate = () => {
    const totalSec = refH * 3600 + refM * 60 + refS;
    if (totalSec === 0) return;
    const result = RACES.map((r) => {
      const predicted = riegelPredict(totalSec, refDist, r.dist);
      const pacePerKm = predicted / r.dist;
      const pm = Math.floor(pacePerKm / 60);
      const ps = Math.round(pacePerKm % 60);
      return {
        name: r.name,
        time: secToHms(predicted),
        pace: `${pm}:${ps.toString().padStart(2, "0")}/km`,
      };
    });
    setPredictions(result);
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            마라톤 완주 시간 예측기
          </h1>
          <p className="mb-8 text-muted-foreground">
            최근 레이스 기록으로 다른 거리 완주 시간을 예측합니다
          </p>

          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                기준 거리 (km)
              </label>
              <select
                value={refDist}
                onChange={(e) => setRefDist(Number(e.target.value))}
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
                기준 기록
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={refH}
                    onChange={(e) => setRefH(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-center"
                    min={0}
                    max={9}
                  />
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    시간
                  </p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={refM}
                    onChange={(e) => setRefM(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-center"
                    min={0}
                    max={59}
                  />
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    분
                  </p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={refS}
                    onChange={(e) => setRefS(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-center"
                    min={0}
                    max={59}
                  />
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    초
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={calculate}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              예측하기
            </button>
          </div>

          {predictions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-3"
            >
              {predictions.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                >
                  <span className="font-medium text-foreground">{p.name}</span>
                  <div className="text-right">
                    <p className="font-bold text-primary">{p.time}</p>
                    <p className="text-xs text-muted-foreground">{p.pace}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Riegel 공식 기반 추정치. 실제 컨디션·코스·날씨에 따라 달라질 수
                있습니다.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RacePredictor;
