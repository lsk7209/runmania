import { useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  AlertTriangle, ExternalLink, CheckCircle2, RotateCcw, ShieldAlert, FileText,
  Ruler, Mountain, Zap, Shield, Weight as WeightIcon, TrendingDown, Footprints, BarChart3,
  Share2, Download, MessageCircle, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { DiagnosisResult, Shoe } from "@/data/shoesDb";
import { getShoeImage } from "@/data/shoeImages";

function shoeSlug(name: string) {
  return name.replace(/\s+/g, "-").replace(/[()]/g, "").toLowerCase();
}

interface ResultPageProps {
  result: DiagnosisResult;
  onRestart: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const StatBar = ({ label, value, max, icon }: { label: string; value: number; max: number; icon: React.ReactNode }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">{icon}{label}</span>
      <span className="font-mono text-primary">{value}/{max}</span>
    </div>
    <Progress value={(value / max) * 100} className="h-1.5 bg-secondary [&>div]:bg-primary" />
  </div>
);

const ShoeImage = ({ shoe }: { shoe: Shoe }) => {
  const img = getShoeImage(shoe.name);
  if (!img) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <img
        src={img}
        alt={shoe.name}
        width={640}
        height={512}
        loading="lazy"
        decoding="async"
        className="h-40 w-full object-cover"
      />
    </div>
  );
};

const DotRating = ({ value, max = 5, color = "bg-primary" }: { value: number; max?: number; color?: string }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, j) => (
      <div key={j} className={`h-2 w-2 rounded-full ${j < value ? color : "bg-muted"}`} />
    ))}
  </div>
);

const ComparisonTable = ({ shoes }: { shoes: Shoe[] }) => {
  if (shoes.length === 0) return null;

  return (
    <div className="space-y-3">
      {shoes.map((shoe, i) => (
        <div
          key={shoe.name}
          className={`rounded-xl border p-4 ${
            i === 0 ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            {i === 0 && (
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                BEST
              </span>
            )}
            <span className={`text-sm font-bold ${i === 0 ? "text-primary" : "text-foreground"}`}>
              {shoe.name}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">쿠션</span>
              <DotRating value={shoe.cushionLevel} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">안정성</span>
              <DotRating value={shoe.stabilityLevel} color="bg-accent" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">무게</span>
              <span className="font-mono">{shoe.weightGrams}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">드롭</span>
              <span className="font-mono">{shoe.dropMm}mm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">발볼</span>
              <span>{shoe.widthAvailable.join("/")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">가격대</span>
              <span>{shoe.priceRange}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ResultPage = ({ result, onRestart }: ResultPageProps) => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const searchQuery = encodeURIComponent(result.recommended.name);
  const allRecommended = [result.recommended, ...result.alternatives];

  const shareText = `🏃 내 러닝화 처방 결과: ${result.typeName}\n👟 추천: ${result.recommended.name}\n${result.banned.length > 0 ? `🚫 금지: ${result.banned.map(s => s.name).join(", ")}\n` : ""}`;
  const shareUrl = window.location.href;

  const handleSaveImage = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#0a0f1a",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `foot-analysis-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "이미지 저장 완료", description: "결과 카드가 이미지로 저장되었습니다." });
    } catch {
      toast({ title: "저장 실패", description: "이미지 저장 중 오류가 발생했습니다.", variant: "destructive" });
    }
  }, [toast]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "러닝화 처방 결과", text: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    }
  }, [shareText, shareUrl]);

  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText + shareUrl);
      setCopied(true);
      toast({ title: "복사 완료", description: "결과가 클립보드에 복사되었습니다." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "복사 실패", variant: "destructive" });
    }
  }, [shareText, shareUrl, toast]);

  const handleKakaoShare = useCallback(() => {
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(kakaoUrl, "_blank", "width=500,height=600");
  }, [shareText, shareUrl]);

  const handleTwitterShare = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank");
  }, [shareText, shareUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <motion.div
        className="w-full max-w-lg"
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.08 }}
      >
        {/* Saveable card area */}
        <div ref={cardRef} className="space-y-4">
        {/* Header */}
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <p className="text-xs tracking-widest text-muted-foreground">FOOT ANALYSIS REPORT</p>
          <p className="mt-1 text-[10px] text-muted-foreground/50">
            발행일: {new Date().toLocaleDateString("ko-KR")}
          </p>
        </motion.div>

        {/* Foot profile summary */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-4 grid grid-cols-2 gap-3"
        >
          {[
            { icon: <Ruler className="h-3 w-3" />, label: "발볼", value: result.footProfile.width },
            { icon: <Mountain className="h-3 w-3" />, label: "아치", value: result.footProfile.arch },
            { icon: <Zap className="h-3 w-3" />, label: "쿠션 필요도", value: result.footProfile.cushionNeed },
            { icon: <Shield className="h-3 w-3" />, label: "안정성 필요도", value: result.footProfile.stabilityNeed },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                {item.icon}
                {item.label}
              </div>
              <p className="text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Prescription card */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 overflow-hidden rounded-2xl border border-border bg-card"
        >
          {/* Type header */}
          <div className="border-b border-border bg-primary/5 p-6">
            <div className="mb-1 flex items-center gap-2">
              <Footprints className="h-4 w-4 text-primary" />
              <span className="text-[10px] tracking-widest text-muted-foreground">진단 결과</span>
            </div>
            <h1 className="mb-1 text-xl font-bold text-primary neon-text">
              {result.typeName}
            </h1>
            <p className="text-sm text-muted-foreground">{result.typeDescription}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recommended shoe with image */}
          <div className="border-b border-border p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              처방 신발 (BEST PICK)
            </div>

            <ShoeImage shoe={result.recommended} />

            <Link to={`/reviews/${shoeSlug(result.recommended.name)}`} className="group">
              <h2 className="mt-4 mb-1 text-xl font-bold group-hover:text-primary transition-colors">
                {result.recommended.name}
                <ExternalLink className="ml-1.5 inline h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </h2>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {result.recommended.description}
            </p>

            {/* Shoe specs */}
            <div className="mb-4 space-y-3">
              <StatBar icon={<TrendingDown className="h-3 w-3" />} label="쿠셔닝" value={result.recommended.cushionLevel} max={5} />
              <StatBar icon={<Shield className="h-3 w-3" />} label="안정성" value={result.recommended.stabilityLevel} max={5} />
            </div>

            {/* Spec chips */}
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-md bg-secondary px-2.5 py-1 text-secondary-foreground">
                <WeightIcon className="mr-1 inline h-3 w-3" />{result.recommended.weightGrams}g
              </span>
              <span className="rounded-md bg-secondary px-2.5 py-1 text-secondary-foreground">
                드롭 {result.recommended.dropMm}mm
              </span>
              {result.recommended.widthAvailable.length > 1 && (
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-primary">
                  사이즈: {result.recommended.widthAvailable.join(" / ")}
                </span>
              )}
              <span className="rounded-md bg-secondary px-2.5 py-1 text-secondary-foreground">
                {result.recommended.priceRange}
              </span>
            </div>
          </div>

          {/* Alternatives with images */}
          {result.alternatives.length > 0 && (
            <div className="border-b border-border p-6">
              <p className="mb-3 text-xs font-medium text-muted-foreground">대안 추천</p>
              <div className="space-y-4">
                {result.alternatives.map((shoe) => (
                  <div key={shoe.name} className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
                    <ShoeImage shoe={shoe} />
                    <div className="p-4">
                      <Link to={`/reviews/${shoeSlug(shoe.name)}`} className="group flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-primary/60" />
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {shoe.name}
                          <ExternalLink className="ml-1 inline h-3 w-3 text-muted-foreground group-hover:text-primary" />
                        </p>
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">{shoe.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                        <span className="rounded bg-secondary px-2 py-0.5 text-muted-foreground">
                          쿠션 {shoe.cushionLevel}/5
                        </span>
                        <span className="rounded bg-secondary px-2 py-0.5 text-muted-foreground">
                          안정성 {shoe.stabilityLevel}/5
                        </span>
                        <span className="rounded bg-secondary px-2 py-0.5 text-muted-foreground">
                          {shoe.weightGrams}g
                        </span>
                        <span className="rounded bg-secondary px-2 py-0.5 text-muted-foreground">
                          {shoe.priceRange}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spec Comparison Table */}
          {allRecommended.length > 1 && (
            <div className="border-b border-border p-6">
              <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                스펙 비교표
              </div>
              <ComparisonTable shoes={allRecommended} />
            </div>
          )}

          {/* Banned shoes */}
          {result.banned.length > 0 && (
            <div className="border-b border-border p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-destructive">
                <ShieldAlert className="h-3.5 w-3.5" />
                착용 금지 (BANNED)
              </div>
              <div className="space-y-3">
                {result.banned.map((shoe) => (
                  <div key={shoe.name} className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden">
                    {getShoeImage(shoe.name) && (
                      <div className="relative">
                        <img
                          src={getShoeImage(shoe.name)}
                          alt={shoe.name}
                          width={640}
                          height={512}
                          loading="lazy"
                          decoding="async"
                          className="h-32 w-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-destructive/90 px-4 py-1.5 text-xs font-bold text-destructive-foreground">
                            착용 금지
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-bold text-destructive">{shoe.name}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{shoe.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescription detail */}
          <div className="p-6 prescription-bg">
            <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">상세 소견</p>
            <p className="text-sm leading-relaxed text-secondary-foreground">
              {result.prescriptionDetail}
            </p>
          </div>
        </motion.div>

        </div>{/* end saveable card area */}

        {/* Share & Save buttons */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-4 mt-6"
        >
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Share2 className="h-3.5 w-3.5 text-primary" />
              결과 공유 & 저장
            </div>

            {/* Save as image */}
            <Button
              onClick={handleSaveImage}
              className="mb-3 w-full gap-2 bg-primary py-5 text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              결과 이미지로 저장하기
            </Button>

            {/* Share row */}
            <div className="grid grid-cols-3 gap-2">
              {/* KakaoTalk */}
              <Button
                variant="outline"
                onClick={handleKakaoShare}
                className="flex-col gap-1 border-border bg-secondary py-4 hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">카카오톡</span>
              </Button>

              {/* Twitter/X */}
              <Button
                variant="outline"
                onClick={handleTwitterShare}
                className="flex-col gap-1 border-border bg-secondary py-4 hover:bg-muted"
              >
                <Share2 className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">X (트위터)</span>
              </Button>

              {/* Copy text */}
              <Button
                variant="outline"
                onClick={handleCopyText}
                className="flex-col gap-1 border-border bg-secondary py-4 hover:bg-muted"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-primary" />}
                <span className="text-[10px] text-muted-foreground">{copied ? "복사됨" : "텍스트 복사"}</span>
              </Button>
            </div>

            {/* Native share (mobile) */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="mt-3 w-full gap-2 border-border bg-secondary py-5 hover:bg-muted"
              >
                <Share2 className="h-4 w-4" />
                다른 앱으로 공유하기
              </Button>
            )}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <a
            href={`https://cafe.naver.com/ArticleSearchList.nhn?search.query=${searchQuery}+사이즈`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full justify-between gap-2 border-border bg-card py-5 hover:bg-secondary">
              이 신발 사이즈 팁 확인 (카페 검색)
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Button>
          </a>

          <a
            href={`https://cafe.naver.com/ArticleSearchList.nhn?search.query=${searchQuery}+핫딜`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full justify-between gap-2 border-border bg-card py-5 hover:bg-secondary">
              최저가 핫딜 정보
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Button>
          </a>

          <a
            href="https://cafe.naver.com/runnersclub"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full justify-between gap-2 border-border bg-card py-5 hover:bg-secondary">
              내 발 사진 검증받기
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Button>
          </a>

          <Button
            variant="ghost"
            onClick={onRestart}
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            다시 진단하기
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultPage;
