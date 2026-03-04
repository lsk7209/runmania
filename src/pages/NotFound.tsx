import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Footprints, Home, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-14">
      <div className="text-center">
        <Footprints className="mx-auto mb-6 h-12 w-12 text-primary" />
        <h1 className="mb-2 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl font-medium text-foreground">페이지를 찾을 수 없습니다</p>
        <p className="mb-8 text-sm text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Home className="h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>
          <Link to="/diagnosis">
            <Button className="gap-2 rounded-xl bg-primary text-primary-foreground">
              <Stethoscope className="h-4 w-4" />
              무료 발 진단 받기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
