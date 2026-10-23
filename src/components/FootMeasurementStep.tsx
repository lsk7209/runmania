import { useState } from "react";
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FOOT_LENGTH_RANGE_MM,
  FOOT_WIDTH_RANGE_MM,
  parseFootMeasurement,
} from "@/lib/footMeasurement";

interface FootMeasurementStepProps {
  onSubmit: (lengthMm?: number, widthMm?: number) => void;
}

const toNumber = (raw: string) => (raw.trim() === "" ? undefined : Number(raw));

/** 발 길이·폭(mm) 선택 입력. 비워 두거나 건너뛰어도 진행할 수 있다. */
const FootMeasurementStep = ({ onSubmit }: FootMeasurementStepProps) => {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = toNumber(length);
    const w = toNumber(width);
    const parsed = parseFootMeasurement(l, w);
    if (parsed.rejected.length > 0) {
      setError(
        `입력값을 확인해 주세요. 길이 ${FOOT_LENGTH_RANGE_MM.min}~${FOOT_LENGTH_RANGE_MM.max}mm, 폭 ${FOOT_WIDTH_RANGE_MM.min}~${FOOT_WIDTH_RANGE_MM.max}mm 범위이며 폭은 길이보다 작아야 합니다.`,
      );
      return;
    }
    onSubmit(parsed.lengthMm, parsed.widthMm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 text-xs leading-5 text-muted-foreground">
        <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        종이 위에 맨발로 서서 뒤꿈치 끝~가장 긴 발가락 끝(길이), 가장 넓은 부분의
        양끝(폭)을 mm로 재 보세요. 저녁 무렵에 재면 더 정확합니다. 모르면 비워 두고
        건너뛰어도 됩니다.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="foot-length">발 길이 (mm)</Label>
          <Input
            id="foot-length"
            inputMode="decimal"
            placeholder="예: 255"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "foot-error" : undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="foot-width">가장 넓은 폭 (mm)</Label>
          <Input
            id="foot-width"
            inputMode="decimal"
            placeholder="예: 100"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "foot-error" : undefined}
          />
        </div>
      </div>
      {error && (
        <p id="foot-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          다음
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => onSubmit(undefined, undefined)}
        >
          측정 안 함 / 건너뛰기
        </Button>
      </div>
    </form>
  );
};

export default FootMeasurementStep;
