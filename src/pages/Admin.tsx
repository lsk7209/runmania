import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import { Eye, EyeOff, Plus, Edit, Trash2, Upload, Clock, CheckCircle2, FileText, Settings, Send, Sparkles } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: any;
  tags: string[] | null;
  read_time: string | null;
  hero_image: string | null;
  related_slugs: string[] | null;
  faq: any;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const adminCall = async (password: string, action: string, data?: any) => {
  const response = await fetch("/api/admin-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password, action, data }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorMessage = errJson.message || errJson.error || errorMessage;
    } catch (e) {
      // Can't parse JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [bulkTitles, setBulkTitles] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [settings, setSettings] = useState({ publish_interval_hours: 24, auto_publish_enabled: true });
  const [showSettings, setShowSettings] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formReadTime, setFormReadTime] = useState("");
  const [formHeroImage, setFormHeroImage] = useState("");
  const [formRelatedSlugs, setFormRelatedSlugs] = useState("");
  const [formFaq, setFormFaq] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      await adminCall(passwordInput, "list", { status: "all" });
      setPassword(passwordInput);
      setAuthenticated(true);
      toast({ title: "로그인 성공" });
    } catch (e: any) {
      toast({
        title: "로그인 실패",
        description: e.message || "서버 통신 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    try {
      const result = await adminCall(password, "list", { status: activeTab });
      setPosts(result || []);
    } catch (e: any) {
      toast({ title: "로딩 실패", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [password, activeTab]);

  const loadSettings = useCallback(async () => {
    if (!password) return;
    try {
      const result = await adminCall(password, "get_settings");
      setSettings(result);
    } catch { }
  }, [password]);

  useEffect(() => {
    if (authenticated) {
      loadPosts();
      loadSettings();
    }
  }, [authenticated, loadPosts, loadSettings]);

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormTitle(post.title);
      setFormSlug(post.slug);
      setFormExcerpt(post.excerpt || "");
      setFormContent(Array.isArray(post.content) ? post.content.join("\n---\n") : "");
      setFormTags((post.tags || []).join(", "));
      setFormReadTime(post.read_time || "");
      setFormHeroImage(post.hero_image || "");
      setFormRelatedSlugs((post.related_slugs || []).join(", "));
      setFormFaq(
        Array.isArray(post.faq)
          ? post.faq.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
          : ""
      );
    } else {
      setEditingPost(null);
      setFormTitle("");
      setFormSlug("");
      setFormExcerpt("");
      setFormContent("");
      setFormTags("");
      setFormReadTime("");
      setFormHeroImage("");
      setFormRelatedSlugs("");
      setFormFaq("");
    }
    setShowEditor(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 100);
  };

  const parseFaq = (text: string) => {
    if (!text.trim()) return [];
    return text.split("\n\n").map((block) => {
      const lines = block.split("\n");
      const question = (lines.find((l) => l.startsWith("Q:")) || "").replace("Q: ", "").trim();
      const answer = (lines.find((l) => l.startsWith("A:")) || "").replace("A: ", "").trim();
      return { question, answer };
    }).filter((f) => f.question && f.answer);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const postData = {
        title: formTitle,
        slug: formSlug || generateSlug(formTitle),
        excerpt: formExcerpt || null,
        content: formContent.split("\n---\n"),
        tags: formTags.split(",").map((t) => t.trim()).filter(Boolean),
        read_time: formReadTime || null,
        hero_image: formHeroImage || null,
        related_slugs: formRelatedSlugs.split(",").map((s) => s.trim()).filter(Boolean),
        faq: parseFaq(formFaq),
      };

      if (editingPost) {
        await adminCall(password, "update", { id: editingPost.id, ...postData });
        toast({ title: "글이 수정되었습니다" });
      } else {
        await adminCall(password, "create", postData);
        toast({ title: "글이 생성되었습니다" });
      }
      setShowEditor(false);
      loadPosts();
    } catch (e: any) {
      toast({ title: "저장 실패", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await adminCall(password, "delete", { id });
      toast({ title: "삭제되었습니다" });
      loadPosts();
    } catch (e: any) {
      toast({ title: "삭제 실패", description: e.message, variant: "destructive" });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminCall(password, "publish", { id });
      toast({ title: "공개되었습니다" });
      loadPosts();
    } catch (e: any) {
      toast({ title: "공개 실패", description: e.message, variant: "destructive" });
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await adminCall(password, "unpublish", { id });
      toast({ title: "비공개 처리되었습니다" });
      loadPosts();
    } catch (e: any) {
      toast({ title: "비공개 실패", description: e.message, variant: "destructive" });
    }
  };

  const handleGenerate = async (id: string) => {
    try {
      setLoading(true);
      toast({ title: "AI 생성 중...", description: "잠시만 기다려주세요 (약 10~20초 소요)" });

      const response = await fetch("/api/admin-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, postId: id }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "생성 실패");

      toast({ title: "AI 생성이 완료되었습니다" });
      loadPosts();
    } catch (e: any) {
      toast({ title: "생성 실패", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    const titles = bulkTitles.split("\n").map((t) => t.trim()).filter(Boolean);
    if (titles.length === 0) return;
    try {
      setLoading(true);
      await adminCall(password, "bulk_create", { titles });
      toast({ title: `${titles.length}개의 초안이 생성되었습니다` });
      setBulkTitles("");
      setShowBulk(false);
      loadPosts();
    } catch (e: any) {
      toast({ title: "일괄 생성 실패", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("기존 하드코딩된 20편의 블로그 글을 DB에 마이그레이션하시겠습니까?\n이미 같은 slug가 있는 글은 업데이트됩니다.")) return;
    try {
      setLoading(true);
      // Dynamically import the seed data
      const { getHardcodedPosts } = await import("@/data/blogSeedData");
      const hardcodedPosts = getHardcodedPosts();
      await adminCall(password, "seed", { posts: hardcodedPosts });
      toast({ title: `${hardcodedPosts.length}편의 글이 마이그레이션되었습니다` });
      loadPosts();
    } catch (e: any) {
      toast({ title: "시드 실패", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await adminCall(password, "update_settings", settings);
      toast({ title: "설정이 저장되었습니다" });
      setShowSettings(false);
    } catch (e: any) {
      toast({ title: "설정 저장 실패", description: e.message, variant: "destructive" });
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      published: "bg-green-500/10 text-green-400 border-green-500/20",
    };
    const labels: Record<string, string> = { draft: "초안", scheduled: "예약", published: "공개" };
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variants[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-14">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">관리자 로그인</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="비밀번호"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "확인 중..." : "로그인"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 pt-24">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">블로그 관리</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSeedData}>
            <Upload className="mr-1 h-4 w-4" />
            기존 글 마이그레이션
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="mr-1 h-4 w-4" />
            발행 설정
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowBulk(true)}>
            <FileText className="mr-1 h-4 w-4" />
            일괄 입력
          </Button>
          <Button size="sm" onClick={() => openEditor()}>
            <Plus className="mr-1 h-4 w-4" />
            새 글
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {[
          { label: "전체", count: posts.length, icon: FileText },
          { label: "초안", count: posts.filter((p) => p.status === "draft").length, icon: Edit },
          { label: "예약", count: posts.filter((p) => p.status === "scheduled").length, icon: Clock },
          { label: "공개", count: posts.filter((p) => p.status === "published").length, icon: CheckCircle2 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post list */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="draft">초안</TabsTrigger>
          <TabsTrigger value="scheduled">예약</TabsTrigger>
          <TabsTrigger value="published">공개</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">로딩 중...</p>
          ) : posts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">글이 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground">/{post.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(post.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditor(post)} title="수정">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleGenerate(post.id)} title="AI 자동 생성">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                        </Button>
                        {post.status !== "published" ? (
                          <Button variant="ghost" size="icon" onClick={() => handlePublish(post.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => handleUnpublish(post.id)}>
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "글 수정" : "새 글 작성"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>제목</Label>
              <Input
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  if (!editingPost) setFormSlug(generateSlug(e.target.value));
                }}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
            </div>
            <div>
              <Label>요약</Label>
              <Input value={formExcerpt} onChange={(e) => setFormExcerpt(e.target.value)} />
            </div>
            <div>
              <Label>본문 (단락 구분: ---)</Label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={12}
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>태그 (쉼표 구분)</Label>
                <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} />
              </div>
              <div>
                <Label>읽기 시간</Label>
                <Input value={formReadTime} onChange={(e) => setFormReadTime(e.target.value)} placeholder="10분" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>히어로 이미지 경로</Label>
                <Input value={formHeroImage} onChange={(e) => setFormHeroImage(e.target.value)} />
              </div>
              <div>
                <Label>관련 글 slug (쉼표 구분)</Label>
                <Input value={formRelatedSlugs} onChange={(e) => setFormRelatedSlugs(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>FAQ (Q: 질문 / A: 답변, 블록은 빈 줄로 구분)</Label>
              <Textarea
                value={formFaq}
                onChange={(e) => setFormFaq(e.target.value)}
                rows={6}
                className="font-mono text-xs"
                placeholder={"Q: 질문 내용\nA: 답변 내용\n\nQ: 다음 질문\nA: 다음 답변"}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>취소</Button>
              <Button onClick={handleSave} disabled={loading || !formTitle}>
                {loading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Dialog */}
      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>제목 일괄 입력</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">한 줄에 하나씩 제목을 입력하세요. 초안(draft)으로 저장됩니다.</p>
            <Textarea
              value={bulkTitles}
              onChange={(e) => setBulkTitles(e.target.value)}
              rows={10}
              placeholder={"첫 번째 글 제목\n두 번째 글 제목\n세 번째 글 제목"}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulk(false)}>취소</Button>
              <Button onClick={handleBulkCreate} disabled={loading || !bulkTitles.trim()}>
                <Send className="mr-1 h-4 w-4" />
                {bulkTitles.split("\n").filter((t) => t.trim()).length}개 생성
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>발행 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">자동 발행</p>
                <p className="text-sm text-muted-foreground">예약된 글을 자동으로 공개합니다</p>
              </div>
              <Switch
                checked={settings.auto_publish_enabled}
                onCheckedChange={(v) => setSettings({ ...settings, auto_publish_enabled: v })}
              />
            </div>
            <div>
              <Label>발행 주기 (시간)</Label>
              <Input
                type="number"
                value={settings.publish_interval_hours}
                onChange={(e) => setSettings({ ...settings, publish_interval_hours: parseInt(e.target.value) || 24 })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {settings.publish_interval_hours}시간 = {(settings.publish_interval_hours / 24).toFixed(1)}일 간격
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>취소</Button>
              <Button onClick={handleSaveSettings}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
