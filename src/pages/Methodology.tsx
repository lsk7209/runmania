import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";
import { SHOES_DB } from "@/data/shoesDb";
import {
  BONUS_RULES,
  EXCLUDE_RULES,
  LIMITS,
  SURVEY_QUESTIONS,
  TOOL_FORMULAS,
  TYPE_PRIORITY,
} from "@/data/methodology";

const SECTION = "border-b border-border px-4 py-12";
const H2 = "mb-4 text-2xl font-bold";
const TH = "border-b border-border px-3 py-2 text-left text-xs font-bold";
const TD = "border-b border-border px-3 py-2 text-sm";

const Methodology = () => {
  usePageMeta({
    title: "진단 방법 | 런닝화매니아",
    description:
      "무료 발 진단이 7문항 답변을 어떻게 점수로 바꿔 러닝화를 추천하는지, 제외 규칙과 가산 점수, 러너 유형 기준, 도구 공식과 한계를 공개합니다.",
    canonicalPath: "/methodology",
    keywords: "러닝화 진단 방법, 러닝화 추천 기준, 발 진단 알고리즘",
  });

  return (
    <main className="min-h-screen pt-14">
      <section className={SECTION}>
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <Compass className="h-5 w-5" /> 진단 방법
          </p>
          <h1 className="mb-4 text-3xl font-bold leading-tight">
            추천은 이렇게 계산됩니다
          </h1>
          <p className="leading-7 text-muted-foreground">
            <Link to="/tools/diagnosis" className="text-primary underline">
              무료 발 진단
            </Link>
            은 7개 문항의 답을 발 프로필로 바꾸고, 등록된 러닝화{" "}
            {SHOES_DB.length}종에 규칙 기반으로 점수를 매겨 가장 높은 신발을
            추천합니다. 아래 표는 실제 계산에 쓰이는 값과 같습니다.
          </p>
        </div>
      </section>

      <section className={SECTION}>
        <div className="mx-auto max-w-3xl">
          <h2 className={H2}>1. 7개 문항</h2>
          <ol className="space-y-2 text-sm leading-6">
            {SURVEY_QUESTIONS.map((q) => (
              <li key={q.no}>
                <strong>
                  {q.no}. {q.label}
                </strong>{" "}
                — {q.effect}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={SECTION}>
        <div className="mx-auto max-w-3xl">
          <h2 className={H2}>2. 먼저 제외하는 신발</h2>
          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            신발마다 편집부가 &quot;이 조건에는 맞지 않음&quot; 태그를 달아
            두었습니다. 해당 조건이면 점수를 깎아 추천에서 빠집니다.
          </p>
          <table className="w-full">
            <thead>
              <tr>
                <th className={TH}>내 조건</th>
                <th className={TH}>제외 감점</th>
              </tr>
            </thead>
            <tbody>
              {EXCLUDE_RULES.map((r) => (
                <tr key={r.tag}>
                  <td className={TD}>{r.condition}</td>
                  <td className={TD}>{r.penalty}점</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={SECTION}>
        <div className="mx-auto max-w-3xl">
          <h2 className={H2}>3. 맞는 신발에 가산하는 점수</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className={TH}>내 조건에 맞는 특성이 있으면</th>
                <th className={TH}>가산</th>
              </tr>
            </thead>
            <tbody>
              {BONUS_RULES.map((r) => (
                <tr key={r.condition}>
                  <td className={TD}>{r.condition}</td>
                  <td className={TD}>+{r.points}점</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-muted-foreground">
            점수가 가장 높은 신발이 1순위, 다음 2개가 대안입니다. 점수가 0
            이하이면 추천에서 제외하고, −50 이하는 &quot;권하지 않는
            신발&quot;로 따로 보여 줍니다.
          </p>
        </div>
      </section>

      <section className={SECTION}>
        <div className="mx-auto max-w-3xl">
          <h2 className={H2}>4. 러너 유형</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            위에서부터 먼저 맞는 유형이 적용됩니다.
          </p>
          <table className="w-full">
            <thead>
              <tr>
                <th className={TH}>유형</th>
                <th className={TH}>조건</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_PRIORITY.map((t) => (
                <tr key={t.name}>
                  <td className={TD}>{t.name}</td>
                  <td className={TD}>{t.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={SECTION}>
        <div className="mx-auto max-w-3xl">
          <h2 className={H2}>5. 도구에 쓰는 공식</h2>
          <ul className="space-y-2 text-sm leading-6">
            {TOOL_FORMULAS.map((t) => (
              <li key={t.path}>
                <Link
                  to={t.path}
                  className="font-medium text-primary underline"
                >
                  {t.tool}
                </Link>{" "}
                — {t.method}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className={H2}>한계</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {LIMITS.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
};

export default Methodology;
