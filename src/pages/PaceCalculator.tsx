import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, Timer, Route, Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePageMeta from "@/hooks/usePageMeta";

const distances = [
  { label: "5K", km: 5 },
  { label: "10K", km: 10 },
  { label: "하프", km: 21.0975 },
  { label: "풀", km: 42.195 },
];

const presets = [
  { label: "입문 (7:00)", pace: 420 },
  { label: "서브5 (7:06)", pace: 426 },
  { label: "취미 (6:00)", pace: 360 },
  { label: "중급 (5:30)", pace: 330 },
  { label: "서브4 (5:41)", pace: 341 },
  { label: "서브3:30 (4:58)", pace: 298 },
  { label: "서브3 (4:15)", pace: 255 },
  { label: "엘리트 (3:30)", pace: 210 },
];

function formatTime(totalSeconds: number): string {
  const total = Math.round(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}시간 ${m.toString().padStart(2, "0")}분 ${s.toString().padStart(2, "0")}초`;
  return `${m}분 ${s.toString().padStart(2, "0")}초`;
}

function formatPace(seconds: number): string {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}'${s.toString().padStart(2, "0")}"`;
}

function paceToSpeed(paceSeconds: number): string {
  if (paceSeconds <= 0) return "0";
  return (3600 / paceSeconds).toFixed(1);
}

const PaceCalculator = () => {
  usePageMeta({
    title: "러닝 페이스 계산기 | 완주 시간 예측 | 런닝화매니아",
    description: "페이스에서 완주 시간, 목표 시간에서 필요 페이스를 즉시 계산. 5K, 10K, 하프, 풀마라톤 러닝 페이스 계산기.",
    canonicalPath: "/tools/pace-calculator",
    keywords: "러닝 페이스 계산기, 마라톤 완주 시간, 러닝 속도 계산",
  });
  const [paceMin, setPaceMin] = useState("6");
  const [paceSec, setPaceSec] = useState("0");
  const [finishH, setFinishH] = useState("");
  const [finishM, setFinishM] = useState("");
  const [finishS, setFinishS] = useState("");
  const [targetDist, setTargetDist] = useState(42.195);
  const [mode, setMode] = useState<"pace-to-time" | "time-to-pace">("pace-to-time");

  const paceSeconds = (parseInt(paceMin) || 0) * 60 + Math.min(59, Math.max(0, parseInt(paceSec) || 0));

  const finishResults = useMemo(() => {
    if (mode !== "pace-to-time" || paceSeconds <= 0) return [];
    return distances.map((d) => ({
      ...d,
      time: formatTime(d.km * paceSeconds),
      totalSec: d.km * paceSeconds,
    }));
  }, [paceSeconds, mode]);

  const calculatedPace = useMemo(() => {
    if (mode !== "time-to-pace") return null;
    const totalSec = (parseInt(finishH) || 0) * 3600 + (parseInt(finishM) || 0) * 60 + Math.min(59, Math.max(0, parseInt(finishS) || 0));
    if (totalSec <= 0 || targetDist <= 0) return null;
    const pace = totalSec / targetDist;
    return { pace, formatted: formatPace(pace), speed: paceToSpeed(pace) };
  }, [finishH, finishM, finishS, targetDist, mode]);

  const handlePreset = (pace: number) => {
    setPaceMin(Math.floor(pace / 60).toString());
    setPaceSec((pace % 60).toString());
    setMode("pace-to-time");
  };

  const handleReset = () => {
    setPaceMin("6");
    setPaceSec("0");
    setFinishH("");
    setFinishM("");
    setFinishS("");
    setTargetDist(42.195);
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-2xl px-4 py-16 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
              <Calculator className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">러닝 페이스 계산기</h1>
            <p className="text-sm text-muted-foreground">페이스 → 완주 시간, 목표 시간 → 필요 페이스를 계산합니다</p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6 flex rounded-xl border border-border bg-secondary p-1">
            <button
              onClick={() => setMode("pace-to-time")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${mode === "pace-to-time"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Timer className="mr-1.5 inline h-3.5 w-3.5" />
              페이스 → 완주시간
            </button>
            <button
              onClick={() => setMode("time-to-pace")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${mode === "time-to-pace"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Route className="mr-1.5 inline h-3.5 w-3.5" />
              완주시간 → 페이스
            </button>
          </div>

          {mode === "pace-to-time" ? (
            <>
              {/* Pace Input */}
              <div className="mb-6 rounded-2xl border border-border bg-card p-6">
                <label className="mb-3 block text-xs font-medium text-muted-foreground">
                  페이스 (min/km)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    value={paceMin}
                    onChange={(e) => setPaceMin(e.target.value)}
                    className="w-20 border-border bg-secondary text-center text-lg font-mono"
                  />
                  <span className="text-muted-foreground">분</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={paceSec}
                    onChange={(e) => setPaceSec(e.target.value)}
                    className="w-20 border-border bg-secondary text-center text-lg font-mono"
                  />
                  <span className="text-muted-foreground">초</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    = {paceToSpeed(paceSeconds)} km/h
                  </span>
                </div>

                {/* Presets */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handlePreset(p.pace)}
                      className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              {paceSeconds > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-xs font-medium text-muted-foreground">예상 완주 시간</p>
                  {finishResults.map((r) => (
                    <div
                      key={r.label}
                      className={`flex items-center justify-between rounded-xl border p-4 ${r.km === 42.195
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-card"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold ${r.km === 42.195
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                            }`}
                        >
                          {r.label}
                        </span>
                        <div>
                          <p className="text-xs text-muted-foreground">{r.km}km</p>
                        </div>
                      </div>
                      <span className={`font-mono text-sm font-bold ${r.km === 42.195 ? "text-primary" : ""}`}>
                        {r.time}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          ) : (
            <>
              {/* Time to Pace */}
              <div className="mb-6 rounded-2xl border border-border bg-card p-6">
                <label className="mb-3 block text-xs font-medium text-muted-foreground">
                  목표 거리
                </label>
                <div className="mb-4 flex gap-2">
                  {distances.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => setTargetDist(d.km)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${targetDist === d.km
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <label className="mb-3 block text-xs font-medium text-muted-foreground">
                  목표 완주 시간
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="12"
                    placeholder="0"
                    value={finishH}
                    onChange={(e) => setFinishH(e.target.value)}
                    className="w-20 border-border bg-secondary text-center text-lg font-mono"
                  />
                  <span className="text-muted-foreground">시간</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={finishM}
                    onChange={(e) => setFinishM(e.target.value)}
                    className="w-20 border-border bg-secondary text-center text-lg font-mono"
                  />
                  <span className="text-muted-foreground">분</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={finishS}
                    onChange={(e) => setFinishS(e.target.value)}
                    className="w-20 border-border bg-secondary text-center text-lg font-mono"
                  />
                  <span className="text-muted-foreground">초</span>
                </div>
              </div>

              {/* Calculated Pace */}
              {calculatedPace && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center"
                >
                  <p className="mb-1 text-xs text-muted-foreground">필요 페이스</p>
                  <p className="mb-2 text-3xl font-bold font-mono text-primary neon-text">
                    {calculatedPace.formatted}
                    <span className="text-sm font-normal text-muted-foreground"> /km</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    = {calculatedPace.speed} km/h
                  </p>
                </motion.div>
              )}
            </>
          )}

          {/* Reset */}
          <div className="mt-6 flex justify-center">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 border-border text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              초기화
            </Button>
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
            <Zap className="mx-auto mb-3 h-6 w-6 text-primary" />
            <p className="mb-1 text-sm font-medium">페이스에 맞는 러닝화가 궁금하다면?</p>
            <p className="mb-4 text-xs text-muted-foreground">발 진단으로 최적의 신발을 찾아보세요</p>
            <Link to="/tools/diagnosis">
              <Button className="gap-2 rounded-xl bg-primary text-primary-foreground neon-border">
                무료 발 진단 받기
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaceCalculator;
