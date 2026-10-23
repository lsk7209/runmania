import { Stethoscope } from "lucide-react";
import {
  MEDICAL_REVIEWER,
  OFFICIAL_HEALTH_SOURCES,
} from "@/data/medicalReview";

/** 통증·부상 주제 글 상단 안내: 진료 권고, 공식 출처, 감수 상태 */
const HealthNotice = () => (
  <aside
    aria-label="건강 정보 안내"
    className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-5 text-secondary-foreground"
  >
    <p className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
      <Stethoscope className="h-4 w-4 shrink-0 text-amber-500" />
      건강 정보 안내
    </p>
    <p>
      이 글은 신발 선택을 돕기 위한 일반 정보이며 진단·치료를 대신하지 않습니다.
      통증이 2주 넘게 이어지거나 붓기·저림·열감이 있으면 달리기를 멈추고
      정형외과 또는 재활의학과 진료를 받으세요.
    </p>
    <p className="mt-2">
      공식 정보:{" "}
      {OFFICIAL_HEALTH_SOURCES.map((source, i) => (
        <span key={source.url}>
          {i > 0 && " · "}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {source.label}
          </a>
        </span>
      ))}
    </p>
    <p className="mt-2 text-muted-foreground">
      {MEDICAL_REVIEWER
        ? `감수: ${MEDICAL_REVIEWER.name} (${MEDICAL_REVIEWER.credential}) · ${MEDICAL_REVIEWER.reviewedAt}`
        : "의료 전문가 감수 전인 글입니다. 에디터팀이 공개 자료를 바탕으로 정리했습니다."}
    </p>
  </aside>
);

export default HealthNotice;
