import { Link } from "react-router-dom";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** 페이지 번호에 대한 이동 주소. 일반 링크라 크롤러와 새 탭에서도 동작한다. */
  hrefFor: (page: number) => string;
}

const linkClass = (active: boolean) =>
  `inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-2 text-sm ${
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card hover:border-primary/40"
  }`;

/** 현재 페이지 주변 번호만 보여주고 앞뒤는 생략 표시한다. */
const visiblePages = (page: number, totalPages: number): (number | "gap")[] => {
  const nums = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...nums].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ["gap" as const, n] : [n]));
};

const Pagination = ({ page, totalPages, hrefFor }: PaginationProps) => {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="페이지 이동" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link to={hrefFor(page - 1)} className={linkClass(false)} rel="prev">
          이전
        </Link>
      )}
      {visiblePages(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={n}
            to={hrefFor(n)}
            className={linkClass(n === page)}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link to={hrefFor(page + 1)} className={linkClass(false)} rel="next">
          다음
        </Link>
      )}
    </nav>
  );
};

export default Pagination;
