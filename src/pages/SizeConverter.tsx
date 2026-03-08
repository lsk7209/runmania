import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ruler, ArrowRight, RotateCcw, Footprints, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePageMeta from "@/hooks/usePageMeta";

type Region = "KR" | "US_M" | "US_W" | "EU" | "UK";

interface SizeRow {
  kr: number;
  usM: number;
  usW: number;
  eu: number;
  uk: number;
  mm: number;
}

const sizeTable: SizeRow[] = [
  { kr: 220, usM: 3.5, usW: 5, eu: 35.5, uk: 3, mm: 220 },
  { kr: 225, usM: 4, usW: 5.5, eu: 36, uk: 3.5, mm: 225 },
  { kr: 230, usM: 4.5, usW: 6, eu: 36.5, uk: 4, mm: 230 },
  { kr: 235, usM: 5, usW: 6.5, eu: 37.5, uk: 4.5, mm: 235 },
  { kr: 240, usM: 6, usW: 7.5, eu: 38.5, uk: 5.5, mm: 240 },
  { kr: 245, usM: 6.5, usW: 8, eu: 39, uk: 6, mm: 245 },
  { kr: 250, usM: 7, usW: 8.5, eu: 40, uk: 6.5, mm: 250 },
  { kr: 255, usM: 7.5, usW: 9, eu: 40.5, uk: 7, mm: 255 },
  { kr: 260, usM: 8, usW: 9.5, eu: 41, uk: 7.5, mm: 260 },
  { kr: 265, usM: 8.5, usW: 10, eu: 42, uk: 8, mm: 265 },
  { kr: 270, usM: 9, usW: 10.5, eu: 42.5, uk: 8.5, mm: 270 },
  { kr: 275, usM: 9.5, usW: 11, eu: 43, uk: 9, mm: 275 },
  { kr: 280, usM: 10, usW: 11.5, eu: 44, uk: 9.5, mm: 280 },
  { kr: 285, usM: 10.5, usW: 12, eu: 44.5, uk: 10, mm: 285 },
  { kr: 290, usM: 11, usW: 12.5, eu: 45, uk: 10.5, mm: 290 },
  { kr: 295, usM: 11.5, usW: 13, eu: 45.5, uk: 11, mm: 295 },
  { kr: 300, usM: 12, usW: 13.5, eu: 46, uk: 11.5, mm: 300 },
  { kr: 305, usM: 12.5, usW: 14, eu: 47, uk: 12, mm: 305 },
  { kr: 310, usM: 13, usW: 14.5, eu: 47.5, uk: 12.5, mm: 310 },
];

const regions: { key: Region; label: string; short: string }[] = [
  { key: "KR", label: "한국 (mm)", short: "KR" },
  { key: "US_M", label: "US 남성", short: "US(M)" },
  { key: "US_W", label: "US 여성", short: "US(W)" },
  { key: "EU", label: "EU", short: "EU" },
  { key: "UK", label: "UK", short: "UK" },
];

function getVal(row: SizeRow, region: Region): number {
  switch (region) {
    case "KR": return row.kr;
    case "US_M": return row.usM;
    case "US_W": return row.usW;
    case "EU": return row.eu;
    case "UK": return row.uk;
  }
}

function formatVal(val: number, region: Region): string {
  if (region === "KR") return val.toString();
  return Number.isInteger(val) ? val.toString() : val.toFixed(1);
}

const SizeConverter = () => {
  usePageMeta({
    title: "러닝화 사이즈 변환기 | KR·US·EU·UK | 런닝화매니아",
    description: "한국(mm), US, EU, UK 러닝화 사이즈를 즉시 상호 변환. 브랜드별 사이즈 차이와 피팅 팁 제공.",
    canonicalPath: "/tools/size-converter",
    keywords: "러닝화 사이즈, 신발 사이즈 변환, US EU UK KR 사이즈",
  });
  const [fromRegion, setFromRegion] = useState<Region>("KR");
  const [inputVal, setInputVal] = useState("270");

  const matchedRow = useMemo(() => {
    const num = parseFloat(inputVal);
    if (isNaN(num)) return null;
    // Find closest match
    let best: SizeRow | null = null;
    let bestDiff = Infinity;
    for (const row of sizeTable) {
      const diff = Math.abs(getVal(row, fromRegion) - num);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = row;
      }
    }
    return best;
  }, [inputVal, fromRegion]);

  const handleReset = () => {
    setFromRegion("KR");
    setInputVal("270");
  };

  const quickSizes: Record<Region, number[]> = {
    KR: [250, 260, 270, 280, 290],
    US_M: [7, 8, 9, 10, 11],
    US_W: [6, 7, 8, 9, 10],
    EU: [39, 41, 42, 44, 45],
    UK: [6, 7, 8, 9, 10],
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-2xl px-4 py-16 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
              <Ruler className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">발 사이즈 변환기</h1>
            <p className="text-sm text-muted-foreground">한국(mm) · US · EU · UK 사이즈를 즉시 변환합니다</p>
          </div>

          {/* From Region */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-6">
            <label className="mb-3 block text-xs font-medium text-muted-foreground">
              기준 사이즈 체계
            </label>
            <div className="mb-4 flex flex-wrap gap-2">
              {regions.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setFromRegion(r.key);
                    setInputVal("");
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${fromRegion === r.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {r.short}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              {regions.find((r) => r.key === fromRegion)?.label} 사이즈 입력
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                step={fromRegion === "KR" ? "5" : "0.5"}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={fromRegion === "KR" ? "270" : "9"}
                className="w-28 border-border bg-secondary text-center text-lg font-mono"
              />
              <span className="text-sm text-muted-foreground">
                {fromRegion === "KR" ? "mm" : regions.find((r) => r.key === fromRegion)?.short ?? fromRegion}
              </span>
            </div>

            {/* Quick sizes */}
            <div className="mt-3 flex flex-wrap gap-2">
              {quickSizes[fromRegion].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setInputVal(sz.toString())}
                  className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {matchedRow && inputVal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                변환 결과
              </div>

              {regions.map((r) => {
                const val = getVal(matchedRow, r.key);
                const isFrom = r.key === fromRegion;
                return (
                  <div
                    key={r.key}
                    className={`flex items-center justify-between rounded-xl border p-4 ${isFrom
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 min-w-[56px] items-center justify-center rounded-lg text-xs font-bold ${isFrom
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                          }`}
                      >
                        {r.short}
                      </span>
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                    </div>
                    <span className={`font-mono text-sm font-bold ${isFrom ? "text-primary" : ""}`}>
                      {formatVal(val, r.key)}
                    </span>
                  </div>
                );
              })}

              {/* Foot length */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 min-w-[56px] items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
                    mm
                  </span>
                  <p className="text-xs text-muted-foreground">발 길이</p>
                </div>
                <span className="font-mono text-sm font-bold">{matchedRow.mm}mm</span>
              </div>
            </motion.div>
          )}

          {/* Reset */}
          <div className="mt-6 flex justify-center">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 border-border text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              초기화
            </Button>
          </div>

          {/* Tip */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-2 text-sm font-bold">💡 사이즈 선택 팁</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• 러닝화는 평소 신발보다 <strong className="text-foreground">5~10mm 크게</strong> 선택하세요</li>
              <li>• 브랜드마다 라스트(골)가 달라 같은 사이즈도 핏이 다를 수 있습니다</li>
              <li>• 발볼이 넓다면 2E/4E 와이드 옵션을 지원하는 모델을 선택하세요</li>
              <li>• 오후에 발이 약간 붓기 때문에 <strong className="text-foreground">오후에 피팅</strong>하는 것을 권장합니다</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
            <Footprints className="mx-auto mb-3 h-6 w-6 text-primary" />
            <p className="mb-1 text-sm font-medium">내 발에 맞는 러닝화가 궁금하다면?</p>
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

export default SizeConverter;
