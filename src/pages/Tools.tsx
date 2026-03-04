import { useSearchParams } from "react-router-dom";
import { Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import usePageMeta from "@/hooks/usePageMeta";
import PaceCalculatorContent from "@/components/tools/PaceCalculatorContent";
import SizeConverterContent from "@/components/tools/SizeConverterContent";

const Tools = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "pace";

  usePageMeta({
    title: "러닝 유틸리티 | 페이스 계산기 & 사이즈 변환 | 런닝화매니아",
    description: "러닝 페이스 계산기와 신발 사이즈 변환기를 한 곳에서. 완주 시간 예측, KR·US·EU·UK 사이즈 변환.",
    canonicalPath: "/tools",
    keywords: "러닝 유틸리티, 페이스 계산기, 사이즈 변환기",
  });

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
            <Wrench className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">러닝 유틸리티</h1>
          <p className="text-sm text-muted-foreground">러너를 위한 필수 도구 모음</p>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="pace">페이스 계산기</TabsTrigger>
            <TabsTrigger value="size">사이즈 변환</TabsTrigger>
          </TabsList>
          <TabsContent value="pace">
            <PaceCalculatorContent />
          </TabsContent>
          <TabsContent value="size">
            <SizeConverterContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tools;
