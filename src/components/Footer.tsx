import { Link } from "react-router-dom";
import { Footprints } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border px-4 py-8">
    <div className="mx-auto max-w-5xl text-center">
      <div className="mb-3 flex items-center justify-center gap-2 text-sm">
        <Footprints className="h-4 w-4 text-primary" />
        <span className="font-bold">런닝화매니아</span>
      </div>
      <nav
        aria-label="푸터 메뉴"
        className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
      >
        <Link to="/about" className="hover:text-primary transition-colors">소개</Link>
        <Link to="/methodology" className="hover:text-primary transition-colors">진단 방법</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">문의</Link>
        <Link to="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</Link>
        <Link to="/terms" className="hover:text-primary transition-colors">이용약관</Link>
        <Link to="/blog" className="hover:text-primary transition-colors">블로그</Link>
        <Link to="/reviews" className="hover:text-primary transition-colors">리뷰</Link>
        <Link to="/tools" className="hover:text-primary transition-colors">도구</Link>
      </nav>
      <p className="mx-auto mb-2 max-w-2xl text-xs leading-5 text-muted-foreground">
        일부 글은 AI 도구의 도움을 받아 초안을 작성한 뒤 에디터가 검토·편집합니다.
        본 사이트의 정보는 의료 진단을 대체하지 않으며, 통증이 지속되면 전문의 상담을 권장합니다.
      </p>
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} 런닝화매니아. 러닝화 추천 · 발 진단 플랫폼.
      </p>
    </div>
  </footer>
);

export default Footer;
