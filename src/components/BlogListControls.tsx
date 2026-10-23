import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, type CategoryKey } from "@/lib/blogListing";

interface BlogListControlsProps {
  query: string;
  category: CategoryKey;
  counts: Record<CategoryKey, number>;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: CategoryKey) => void;
}

const BlogListControls = ({
  query,
  category,
  counts,
  onQueryChange,
  onCategoryChange,
}: BlogListControlsProps) => (
  <div className="mb-8 space-y-4">
    <div className="relative">
      <Label htmlFor="blog-search" className="sr-only">
        블로그 글 검색
      </Label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="blog-search"
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="모델명·브랜드·주제로 검색 (예: 카야노, 평발, 족저근막)"
        className="pl-9"
        maxLength={60}
      />
    </div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="글 분류">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          type="button"
          onClick={() => onCategoryChange(cat.key)}
          aria-pressed={category === cat.key}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            category === cat.key
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
          }`}
        >
          {cat.label}
          <span className="ml-1.5 text-xs opacity-70">{counts[cat.key]}</span>
        </button>
      ))}
    </div>
  </div>
);

export default BlogListControls;
