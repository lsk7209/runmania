import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type ContentType = "blog" | "review" | "utility";
type WorkflowStatus = "idea" | "reviewing" | "approved";
type PublishStatus = "draft" | "scheduled" | "published";
type SearchIntent = "auto" | "informational" | "commercial" | "transactional" | "comparison" | "local";

type InternalLinkSuggestion = {
  slug: string;
  title: string;
  anchor: string;
  reason: string;
};

type QualityGateSnapshot = {
  passed: boolean;
  score: number;
  blockers: string[];
  warnings: string[];
};

interface GenerationMeta {
  template: string;
  targetAudience: string;
  tone: string;
  length: string;
  seoKeywords: string[];
  cta: string;
  contentType?: ContentType;
  primaryKeyword: string;
  searchIntent: SearchIntent;
  competitorUrls: string[];
  referenceUrls: string[];
  mustIncludeSections: string[];
  originalTitle?: string;
  refinedTitle?: string;
  titleCandidates?: string[];
  serpQuery?: string;
  articleAngle?: string;
  serpSummary?: string;
  competitorHighlights?: string[];
  faqQuestions?: string[];
  sourceUrls?: string[];
  internalLinks?: InternalLinkSuggestion[];
  metaTitle?: string;
  metaDescription?: string;
  schemaType?: string;
  schemaJson?: Record<string, unknown>;
  qualityGate?: QualityGateSnapshot;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string[];
  tags: string[] | null;
  read_time: string | null;
  hero_image: string | null;
  related_slugs: string[] | null;
  faq: Array<{ question: string; answer: string }>;
  status: PublishStatus;
  content_type: ContentType;
  workflow_status: WorkflowStatus;
  generation_meta: GenerationMeta;
  generation_count: number;
  last_generated_at: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface GenerationLog {
  id: string;
  post_id: string;
  status: string;
  content_type: ContentType | null;
  workflow_status: WorkflowStatus | null;
  requested_prompt: GenerationMeta | Record<string, unknown>;
  generated_title: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface BulkPipelineResponse {
  created: number;
  generated: number;
  scheduled: number;
  failed: number;
  ids: string[];
  results?: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    workflow_status: string;
    scheduled_at: string | null;
    error: string | null;
  }>;
}

const defaultGenerationMeta = (): GenerationMeta => ({
  template: "guide",
  targetAudience: "",
  tone: "expert",
  length: "medium",
  seoKeywords: [],
  cta: "",
  contentType: "blog",
  primaryKeyword: "",
  searchIntent: "auto",
  competitorUrls: [],
  referenceUrls: [],
  mustIncludeSections: [],
});

const defaultBulkScheduleStart = () => {
  const nextHour = new Date();
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  return toDatetimeLocalValue(nextHour.toISOString());
};

const emptyPost = () => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
  readTime: "",
  heroImage: "",
  relatedSlugs: "",
  faq: "",
  status: "draft" as PublishStatus,
  scheduledAt: "",
  contentType: "blog" as ContentType,
  workflowStatus: "idea" as WorkflowStatus,
  generationMeta: defaultGenerationMeta(),
});

const adminCall = async (password: string, action: string, data?: unknown) => {
  const response = await fetch("/api/admin-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, action, data }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
  }
  return payload;
};

const generateContent = async (password: string, postId: string, options?: Partial<GenerationMeta>) => {
  const response = await fetch("/api/admin-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, postId, options }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
  }
  return payload;
};

const statusLabels: Record<PublishStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

const workflowLabels: Record<WorkflowStatus, string> = {
  idea: "Idea",
  reviewing: "Reviewing",
  approved: "Approved",
};

const contentTypeLabels: Record<ContentType, string> = {
  blog: "Blog",
  review: "Review",
  utility: "Utility",
};

const searchIntentLabels: Record<SearchIntent, string> = {
  auto: "Auto",
  informational: "Informational",
  commercial: "Commercial",
  transactional: "Transactional",
  comparison: "Comparison",
  local: "Local",
};

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | PublishStatus>("all");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bulkTitles, setBulkTitles] = useState("");
  const [bulkContentType, setBulkContentType] = useState<ContentType>("blog");
  const [bulkAutoGenerate, setBulkAutoGenerate] = useState(true);
  const [bulkAutoSchedule, setBulkAutoSchedule] = useState(true);
  const [bulkScheduleStartAt, setBulkScheduleStartAt] = useState(defaultBulkScheduleStart);
  const [bulkScheduleIntervalHours, setBulkScheduleIntervalHours] = useState(24);
  const [bulkGenerationMeta, setBulkGenerationMeta] = useState<GenerationMeta>({
    ...defaultGenerationMeta(),
    contentType: "blog",
  });
  const [settings, setSettings] = useState({ publish_interval_hours: 24, auto_publish_enabled: true });
  const [form, setForm] = useState(emptyPost());

  const loadPosts = useCallback(async () => {
    if (!password) return;
    const result = await adminCall(password, "list", { status: activeTab });
    setPosts(result);
  }, [activeTab, password]);

  const loadLogs = useCallback(async () => {
    if (!password) return;
    const result = await adminCall(password, "get_generation_logs");
    setLogs(result);
  }, [password]);

  const loadSettings = useCallback(async () => {
    if (!password) return;
    const result = await adminCall(password, "get_settings");
    setSettings(result);
  }, [password]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadPosts(), loadLogs(), loadSettings()]);
    } catch (error: unknown) {
      toast({ title: "Failed to load admin data", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [loadLogs, loadPosts, loadSettings]);

  const finishPostAction = (postId: string) => {
    setBusyPostId((current) => (current === postId ? null : current));
  };

  const resetBulkForm = useCallback(() => {
    setBulkTitles("");
    setBulkContentType("blog");
    setBulkAutoGenerate(true);
    setBulkAutoSchedule(true);
    setBulkScheduleStartAt(defaultBulkScheduleStart());
    setBulkScheduleIntervalHours(Number(settings.publish_interval_hours) || 24);
    setBulkGenerationMeta({
      ...defaultGenerationMeta(),
      contentType: "blog",
    });
  }, [settings.publish_interval_hours]);

  const openBulkDialog = () => {
    resetBulkForm();
    setShowBulk(true);
  };

  useEffect(() => {
    if (authenticated) {
      refreshAll();
    }
  }, [authenticated, refreshAll]);

  useEffect(() => {
    if (authenticated) {
      loadPosts().catch((error: unknown) => {
        toast({ title: "Failed to refresh posts", description: getErrorMessage(error), variant: "destructive" });
      });
    }
  }, [activeTab, authenticated, loadPosts]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await adminCall(passwordInput, "list", { status: "all" });
      setPassword(passwordInput);
      setAuthenticated(true);
      toast({ title: "Admin login successful" });
    } catch (error: unknown) {
      toast({ title: "Login failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (post?: BlogPost) => {
    if (!post) {
      setEditingPost(null);
      setForm(emptyPost());
      setShowEditor(true);
      return;
    }

    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: Array.isArray(post.content) ? post.content.join("\n---\n") : "",
      tags: (post.tags || []).join(", "),
      readTime: post.read_time || "",
      heroImage: post.hero_image || "",
      relatedSlugs: (post.related_slugs || []).join(", "),
      faq: Array.isArray(post.faq)
        ? post.faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n")
        : "",
      status: post.status,
      scheduledAt: toDatetimeLocalValue(post.scheduled_at),
      contentType: post.content_type || "blog",
      workflowStatus: post.workflow_status || "idea",
      generationMeta: {
        ...defaultGenerationMeta(),
        ...(post.generation_meta || {}),
        contentType: post.content_type || "blog",
      },
    });
    setShowEditor(true);
  };

  const updateForm = <K extends keyof ReturnType<typeof emptyPost>>(key: K, value: ReturnType<typeof emptyPost>[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateGenerationMeta = <K extends keyof GenerationMeta>(key: K, value: GenerationMeta[K]) => {
    setForm((current) => ({
      ...current,
      generationMeta: {
        ...current.generationMeta,
        [key]: value,
      },
    }));
  };

  const updateBulkGenerationMeta = <K extends keyof GenerationMeta>(key: K, value: GenerationMeta[K]) => {
    setBulkGenerationMeta((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    const scheduledAt = form.status === "scheduled" ? toIsoDatetime(form.scheduledAt) : null;
    if (form.status === "scheduled" && form.workflowStatus !== "approved") {
      toast({
        title: "Approval required",
        description: "Approve the post before saving it as scheduled.",
        variant: "destructive",
      });
      return;
    }

    if (form.status === "scheduled" && !scheduledAt) {
      toast({
        title: "Schedule time required",
        description: "Set a valid publish time for scheduled posts.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || null,
      content: form.content
        .split("\n---\n")
        .map((block) => block.trim())
        .filter(Boolean),
      tags: splitCsv(form.tags),
      read_time: form.readTime.trim() || null,
      hero_image: form.heroImage.trim() || null,
      related_slugs: splitCsv(form.relatedSlugs),
      faq: parseFaq(form.faq),
      status: form.status,
      scheduled_at: scheduledAt,
      content_type: form.contentType,
      workflow_status: form.workflowStatus,
      generation_meta: {
        ...form.generationMeta,
        seoKeywords: splitCsv(form.generationMeta.seoKeywords.join(", ")),
        contentType: form.contentType,
      },
    };

    setLoading(true);
    try {
      if (editingPost) {
        await adminCall(password, "update", { id: editingPost.id, ...payload });
        toast({ title: "Post updated" });
      } else {
        await adminCall(password, "create", payload);
        toast({ title: "Draft created" });
      }
      setShowEditor(false);
      await refreshAll();
    } catch (error: unknown) {
      toast({ title: "Save failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (post: BlogPost) => {
    if (post.status === "published") {
      toast({
        title: "Unpublish first",
        description: "Move the live post back to draft before generating a new AI draft.",
        variant: "destructive",
      });
      return;
    }

    setBusyPostId(post.id);
    setLoading(true);
    try {
      await generateContent(password, post.id, post.generation_meta || {});
      toast({ title: "AI draft generated", description: "Workflow moved to Reviewing." });
      await refreshAll();
    } catch (error: unknown) {
      toast({ title: "AI generation failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
      finishPostAction(post.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post?")) return;

    setBusyPostId(id);
    setLoading(true);
    try {
      await adminCall(password, "delete", { id });
      toast({ title: "Post deleted" });
      await refreshAll();
    } catch (error: unknown) {
      toast({ title: "Delete failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
      finishPostAction(id);
    }
  };

  const handlePublish = async (post: BlogPost) => {
    if (post.workflow_status !== "approved") {
      toast({
        title: "Approval required",
        description: "Approve the post before publishing it.",
        variant: "destructive",
      });
      return;
    }

    setBusyPostId(post.id);
    setLoading(true);
    try {
      await adminCall(password, "publish", { id: post.id });
      toast({ title: "Post published" });
      await refreshAll();
    } catch (error: unknown) {
      toast({ title: "Publish failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
      finishPostAction(post.id);
    }
  };

  const handleUnpublish = async (id: string) => {
    setBusyPostId(id);
    setLoading(true);
    try {
      await adminCall(password, "unpublish", { id });
      toast({ title: "Moved back to draft" });
      await refreshAll();
    } catch (error: unknown) {
      toast({ title: "Unpublish failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
      finishPostAction(id);
    }
  };

  const handleWorkflowUpdate = async (post: BlogPost, workflowStatus: WorkflowStatus) => {
    if (post.status === "published" && workflowStatus !== "approved") {
      toast({
        title: "Unpublish first",
        description: "Move the live post back to draft before sending it to review.",
        variant: "destructive",
      });
      return;
    }

    setBusyPostId(post.id);
    setLoading(true);
    try {
      await adminCall(password, "update_workflow", { id: post.id, workflow_status: workflowStatus });
      toast({ title: `Workflow set to ${workflowLabels[workflowStatus]}` });
      await refreshAll();
    } catch (error: unknown) {
      toast({ title: "Workflow update failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
      finishPostAction(post.id);
    }
  };

  const handleBulkCreate = async () => {
    const titles = bulkTitles
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (titles.length === 0) return;

    const generationMeta = {
      ...bulkGenerationMeta,
      seoKeywords: splitCsv(bulkGenerationMeta.seoKeywords.join(", ")),
      contentType: bulkContentType,
    };

    if (bulkAutoSchedule && !bulkScheduleStartAt) {
      toast({
        title: "Schedule required",
        description: "Set the first publish time for the bulk schedule.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (!bulkAutoGenerate) {
        await adminCall(password, "bulk_create", {
          titles,
          content_type: bulkContentType,
          generation_meta: generationMeta,
        });
        toast({ title: `${titles.length} drafts created` });
      } else {
        const result = (await adminCall(password, "bulk_pipeline", {
          titles,
          content_type: bulkContentType,
          generation_meta: generationMeta,
          auto_generate: true,
          auto_schedule: bulkAutoSchedule,
          first_scheduled_at: bulkAutoSchedule ? toIsoDatetime(bulkScheduleStartAt) : null,
          schedule_interval_hours: bulkAutoSchedule ? bulkScheduleIntervalHours : null,
        })) as BulkPipelineResponse;

        const description = bulkAutoSchedule
          ? `${result.generated} generated, ${result.scheduled} scheduled, ${result.failed} failed.`
          : `${result.generated} generated, ${result.failed} failed.`;
        toast({
          title: bulkAutoSchedule ? "Bulk AI generation and scheduling complete" : "Bulk AI generation complete",
          description,
        });
        if (result.results?.some((item) => item.error)) {
          const firstError = result.results.find((item) => item.error)?.error;
          toast({
            title: "Some posts need manual review",
            description: firstError || "One or more generated posts did not pass the quality gate.",
            variant: "destructive",
          });
        }
      }

      setShowBulk(false);
      resetBulkForm();
      await refreshAll();
    } catch (error: unknown) {
      toast({ title: "Bulk create failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm("Import hardcoded blog seed data into the database?")) return;

    setLoading(true);
    try {
      const { getHardcodedPosts } = await import("@/data/blogSeedData");
      await adminCall(password, "seed", { posts: getHardcodedPosts() });
      toast({ title: "Seed data imported" });
      await refreshAll();
    } catch (error: unknown) {
      toast({ title: "Seed import failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await adminCall(password, "update_settings", settings);
      toast({ title: "Settings updated" });
      setShowSettings(false);
    } catch (error: unknown) {
      toast({ title: "Settings update failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleLogin();
              }}
            />
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Checking..." : "Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPosts = posts.length;
  const draftCount = posts.filter((post) => post.status === "draft").length;
  const publishedCount = posts.filter((post) => post.status === "published").length;
  const reviewingCount = posts.filter((post) => post.workflow_status === "reviewing").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 pt-24">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Admin</h1>
          <p className="text-sm text-muted-foreground">
            Manage AI generation for blog, review, and utility content with review workflow and logs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleSeedData}>
            <Upload className="mr-1 h-4 w-4" />
            Seed import
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="mr-1 h-4 w-4" />
            Publish settings
          </Button>
          <Button variant="outline" size="sm" onClick={openBulkDialog}>
            <FileText className="mr-1 h-4 w-4" />
            Bulk AI
          </Button>
          <Button size="sm" onClick={() => openEditor()}>
            <Plus className="mr-1 h-4 w-4" />
            New content
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <StatsCard label="Total" count={totalPosts} icon={FileText} />
        <StatsCard label="Drafts" count={draftCount} icon={Edit} />
        <StatsCard label="Reviewing" count={reviewingCount} icon={Clock} />
        <StatsCard label="Published" count={publishedCount} icon={CheckCircle2} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Content Queue</CardTitle>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | PublishStatus)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} />
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading && posts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No posts found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>AI</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <p className="line-clamp-1 font-medium">{post.title}</p>
                          <p className="text-xs text-muted-foreground">/{post.slug}</p>
                          {getRefinedTitle(post) ? (
                            <p className="text-xs text-muted-foreground">
                              Refined: <span className="text-foreground">{getRefinedTitle(post)}</span>
                            </p>
                          ) : null}
                          {getPrimaryKeyword(post) || getSearchIntent(post) ? (
                            <p className="text-xs text-muted-foreground">
                              {getPrimaryKeyword(post) ? `Keyword: ${getPrimaryKeyword(post)}` : "Keyword: n/a"}
                              {getSearchIntent(post) ? ` / Intent: ${searchIntentLabels[getSearchIntent(post)!]}` : ""}
                            </p>
                          ) : null}
                          {post.status === "scheduled" && post.scheduled_at ? (
                            <p className="text-xs text-muted-foreground">
                              Publishes {formatDate(post.scheduled_at)}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{contentTypeLabels[post.content_type] || post.content_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "outline"}>
                          {statusLabels[post.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.workflow_status === "approved" ? "default" : "outline"}>
                          {workflowLabels[post.workflow_status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>{post.generation_count || 0} runs</div>
                        <div>{post.last_generated_at ? formatDate(post.last_generated_at) : "Not generated"}</div>
                        {getQualityGate(post) ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant={getQualityGate(post)!.passed ? "default" : "destructive"}>
                              Quality {getQualityGate(post)!.passed ? "Passed" : "Review"} ({getQualityGate(post)!.score})
                            </Badge>
                            <span>{getSourceCount(post)} sources</span>
                            <span>{getInternalLinkCount(post)} links</span>
                          </div>
                        ) : null}
                        {getQualityGate(post)?.blockers?.length ? (
                          <p className="mt-1 text-xs text-destructive line-clamp-2">
                            {getQualityGate(post)!.blockers[0]}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditor(post)}
                            title="Edit"
                            disabled={loading || busyPostId === post.id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerate(post)}
                            title={
                              post.status === "published"
                                ? "Unpublish before generating a new AI draft"
                                : "Generate AI"
                            }
                            disabled={loading || busyPostId === post.id || post.status === "published"}
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWorkflowUpdate(post, "reviewing")}
                            disabled={loading || busyPostId === post.id || post.workflow_status === "reviewing" || post.status === "published"}
                            title={
                              post.status === "published"
                                ? "Unpublish before moving a live post to review"
                                : "Move to review"
                            }
                          >
                            Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWorkflowUpdate(post, "approved")}
                            disabled={loading || busyPostId === post.id || post.workflow_status === "approved"}
                          >
                            Approve
                          </Button>
                          {post.status !== "published" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePublish(post)}
                              title={
                                post.workflow_status === "approved"
                                  ? "Publish"
                                  : "Approve before publishing"
                              }
                              disabled={loading || busyPostId === post.id || post.workflow_status !== "approved"}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnpublish(post.id)}
                              title="Unpublish"
                              disabled={loading || busyPostId === post.id}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post.id)}
                            title="Delete"
                            disabled={loading || busyPostId === post.id}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No generation logs yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <Badge variant={log.status === "completed" ? "default" : log.status === "failed" ? "destructive" : "outline"}>
                      {log.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium">{log.generated_title || "Pending title"}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.content_type ? contentTypeLabels[log.content_type] : "Unknown"} /{" "}
                    {log.workflow_status ? workflowLabels[log.workflow_status] : "N/A"}
                  </p>
                  {"template" in log.requested_prompt ? (
                    <>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Template: {String(log.requested_prompt.template || "guide")} / Tone:{" "}
                        {String(log.requested_prompt.tone || "expert")}
                      </p>
                      {"refinedTitle" in log.requested_prompt && log.requested_prompt.refinedTitle ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Refined: {String(log.requested_prompt.refinedTitle)}
                        </p>
                      ) : null}
                      {"primaryKeyword" in log.requested_prompt && log.requested_prompt.primaryKeyword ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Keyword: {String(log.requested_prompt.primaryKeyword)} / Intent:{" "}
                          {String(log.requested_prompt.searchIntent || "auto")}
                        </p>
                      ) : null}
                      {"sourceUrls" in log.requested_prompt && Array.isArray(log.requested_prompt.sourceUrls) ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Sources: {log.requested_prompt.sourceUrls.length} / Internal links:{" "}
                          {Array.isArray(log.requested_prompt.internalLinks) ? log.requested_prompt.internalLinks.length : 0}
                        </p>
                      ) : null}
                      {"qualityGate" in log.requested_prompt &&
                      log.requested_prompt.qualityGate &&
                      typeof log.requested_prompt.qualityGate === "object" ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Quality gate:{" "}
                          {String(
                            (log.requested_prompt.qualityGate as QualityGateSnapshot).passed ? "passed" : "needs review",
                          )}{" "}
                          ({String((log.requested_prompt.qualityGate as QualityGateSnapshot).score ?? "n/a")})
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  {log.error_message ? <p className="mt-1 text-xs text-destructive">{log.error_message}</p> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit content" : "Create content"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    updateForm("title", title);
                    if (!editingPost) updateForm("slug", slugify(title));
                  }}
                />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Content type">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.contentType}
                  onChange={(event) => {
                    const value = event.target.value as ContentType;
                    updateForm("contentType", value);
                    updateGenerationMeta("contentType", value);
                  }}
                >
                  <option value="blog">Blog</option>
                  <option value="review">Review</option>
                  <option value="utility">Utility</option>
                </select>
              </Field>
              <Field label="Publish status">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(event) => {
                    const nextStatus = event.target.value as PublishStatus;
                    updateForm("status", nextStatus);
                    if (nextStatus !== "scheduled") {
                      updateForm("scheduledAt", "");
                    }
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </Field>
              <Field label="Workflow">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.workflowStatus}
                  onChange={(event) => updateForm("workflowStatus", event.target.value as WorkflowStatus)}
                >
                  <option value="idea">Idea</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                </select>
              </Field>
            </div>
            {form.status === "scheduled" ? (
              <Field label="Scheduled publish time">
                <>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(event) => updateForm("scheduledAt", event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Scheduled posts must stay approved to be auto-published.
                  </p>
                </>
              </Field>
            ) : null}
            <Field label="Excerpt">
              <Textarea value={form.excerpt} onChange={(event) => updateForm("excerpt", event.target.value)} rows={3} />
            </Field>

            <Field label="Content blocks (`---` separator)">
              <Textarea
                value={form.content}
                onChange={(event) => updateForm("content", event.target.value)}
                rows={12}
                className="font-mono text-xs"
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tags">
                <Input value={form.tags} onChange={(event) => updateForm("tags", event.target.value)} placeholder="keyword1, keyword2" />
              </Field>
              <Field label="Read time">
                <Input value={form.readTime} onChange={(event) => updateForm("readTime", event.target.value)} placeholder="8분" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Hero image">
                <Input value={form.heroImage} onChange={(event) => updateForm("heroImage", event.target.value)} />
              </Field>
              <Field label="Related slugs">
                <Input value={form.relatedSlugs} onChange={(event) => updateForm("relatedSlugs", event.target.value)} placeholder="slug-1, slug-2" />
              </Field>
            </div>

            <Field label="FAQ blocks">
              <Textarea
                value={form.faq}
                onChange={(event) => updateForm("faq", event.target.value)}
                rows={6}
                className="font-mono text-xs"
                placeholder={"Q: Question\nA: Answer\n\nQ: Another question\nA: Another answer"}
              />
            </Field>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">AI generation settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Template">
                    <Input
                      value={form.generationMeta.template}
                      onChange={(event) => updateGenerationMeta("template", event.target.value)}
                      placeholder="guide, comparison, faq, best-of"
                    />
                  </Field>
                  <Field label="Target audience">
                    <Input
                      value={form.generationMeta.targetAudience}
                      onChange={(event) => updateGenerationMeta("targetAudience", event.target.value)}
                      placeholder="beginner runners, wide-foot runners"
                    />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Tone">
                    <Input value={form.generationMeta.tone} onChange={(event) => updateGenerationMeta("tone", event.target.value)} />
                  </Field>
                  <Field label="Length">
                    <select
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                      value={form.generationMeta.length}
                      onChange={(event) => updateGenerationMeta("length", event.target.value)}
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </Field>
                  <Field label="CTA">
                    <Input value={form.generationMeta.cta} onChange={(event) => updateGenerationMeta("cta", event.target.value)} />
                  </Field>
                  <Field label="Primary keyword">
                    <Input
                      value={form.generationMeta.primaryKeyword}
                      onChange={(event) => updateGenerationMeta("primaryKeyword", event.target.value)}
                      placeholder="러닝화 추천"
                    />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Search intent">
                    <select
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                      value={form.generationMeta.searchIntent}
                      onChange={(event) => updateGenerationMeta("searchIntent", event.target.value as SearchIntent)}
                    >
                      {Object.entries(searchIntentLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="SEO keywords">
                    <Input
                      value={form.generationMeta.seoKeywords.join(", ")}
                      onChange={(event) => updateGenerationMeta("seoKeywords", splitCsv(event.target.value))}
                      placeholder="러닝화 추천, 발볼 넓은 러닝화"
                    />
                  </Field>
                </div>
                <Field label="Must-cover sections">
                  <Textarea
                    value={joinLines(form.generationMeta.mustIncludeSections)}
                    onChange={(event) => updateGenerationMeta("mustIncludeSections", splitListText(event.target.value))}
                    rows={4}
                    placeholder={"핵심 요약\n선택 기준\n실수하기 쉬운 부분"}
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Competitor URLs">
                    <Textarea
                      value={joinLines(form.generationMeta.competitorUrls)}
                      onChange={(event) => updateGenerationMeta("competitorUrls", splitListText(event.target.value))}
                      rows={4}
                      placeholder={"https://example.com/article-1\nhttps://example.com/article-2"}
                    />
                  </Field>
                  <Field label="Reference URLs">
                    <Textarea
                      value={joinLines(form.generationMeta.referenceUrls)}
                      onChange={(event) => updateGenerationMeta("referenceUrls", splitListText(event.target.value))}
                      rows={4}
                      placeholder={"https://trusted-source.com/report\nhttps://trusted-source.com/guide"}
                    />
                  </Field>
                </div>
                <p className="text-xs text-muted-foreground">
                  The generator will refine the input title, infer search intent when needed, analyze the live SERP,
                  generate meta/schema outputs, and run a quality gate before bulk auto-approval.
                </p>
                {hasSeoSnapshot(form.generationMeta) ? (
                  <div className="rounded-xl border p-4 text-sm">
                    <p className="font-medium">SEO automation snapshot</p>
                    {form.generationMeta.refinedTitle ? (
                      <p className="mt-2 text-muted-foreground">
                        Refined title: <span className="text-foreground">{form.generationMeta.refinedTitle}</span>
                      </p>
                    ) : null}
                    {form.generationMeta.metaTitle ? (
                      <p className="mt-1 text-muted-foreground">
                        Meta title: <span className="text-foreground">{form.generationMeta.metaTitle}</span>
                      </p>
                    ) : null}
                    {form.generationMeta.metaDescription ? (
                      <p className="mt-1 text-muted-foreground">
                        Meta description: <span className="text-foreground">{form.generationMeta.metaDescription}</span>
                      </p>
                    ) : null}
                    {form.generationMeta.sourceUrls?.length ? (
                      <p className="mt-1 text-muted-foreground">
                        Sources: <span className="text-foreground">{form.generationMeta.sourceUrls.length}</span>
                      </p>
                    ) : null}
                    {form.generationMeta.internalLinks?.length ? (
                      <p className="mt-1 text-muted-foreground">
                        Internal links: <span className="text-foreground">{form.generationMeta.internalLinks.length}</span>
                      </p>
                    ) : null}
                    {form.generationMeta.qualityGate ? (
                      <>
                        <p className="mt-1 text-muted-foreground">
                          Quality gate:{" "}
                          <span className={form.generationMeta.qualityGate.passed ? "text-foreground" : "text-destructive"}>
                            {form.generationMeta.qualityGate.passed ? "Passed" : "Needs review"} ({form.generationMeta.qualityGate.score})
                          </span>
                        </p>
                        {form.generationMeta.qualityGate.blockers.length ? (
                          <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                            <p className="font-medium">Blockers</p>
                            {form.generationMeta.qualityGate.blockers.map((item) => (
                              <p key={item} className="mt-1">
                                {item}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {form.generationMeta.qualityGate.warnings.length ? (
                          <div className="mt-2 rounded-lg border p-3 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">Warnings</p>
                            {form.generationMeta.qualityGate.warnings.map((item) => (
                              <p key={item} className="mt-1">
                                {item}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || !form.title.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk AI generation pipeline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Content type">
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={bulkContentType}
                onChange={(event) => {
                  const value = event.target.value as ContentType;
                  setBulkContentType(value);
                  updateBulkGenerationMeta("contentType", value);
                }}
              >
                <option value="blog">Blog</option>
                <option value="review">Review</option>
                <option value="utility">Utility</option>
              </select>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Generate immediately</p>
                  <p className="text-xs text-muted-foreground">Create the draft and run AI writing right away.</p>
                </div>
                <Switch
                  checked={bulkAutoGenerate}
                  onCheckedChange={(value) => {
                    setBulkAutoGenerate(value);
                    if (!value) setBulkAutoSchedule(false);
                  }}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Auto-schedule publish</p>
                  <p className="text-xs text-muted-foreground">Approve and schedule each generated article automatically.</p>
                </div>
                <Switch
                  checked={bulkAutoSchedule}
                  disabled={!bulkAutoGenerate}
                  onCheckedChange={(value) => {
                    if (!bulkAutoGenerate) return;
                    setBulkAutoSchedule(value);
                  }}
                />
              </div>
            </div>
            {bulkAutoGenerate ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">AI quality settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Template">
                      <Input
                        value={bulkGenerationMeta.template}
                        onChange={(event) => updateBulkGenerationMeta("template", event.target.value)}
                        placeholder="guide, comparison, faq, authority"
                      />
                    </Field>
                    <Field label="Target audience">
                      <Input
                        value={bulkGenerationMeta.targetAudience}
                        onChange={(event) => updateBulkGenerationMeta("targetAudience", event.target.value)}
                        placeholder="beginner runners, marathon trainees"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Tone">
                      <Input
                        value={bulkGenerationMeta.tone}
                        onChange={(event) => updateBulkGenerationMeta("tone", event.target.value)}
                      />
                    </Field>
                    <Field label="Length">
                      <select
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                        value={bulkGenerationMeta.length}
                        onChange={(event) => updateBulkGenerationMeta("length", event.target.value)}
                      >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </Field>
                    <Field label="CTA">
                      <Input
                        value={bulkGenerationMeta.cta}
                        onChange={(event) => updateBulkGenerationMeta("cta", event.target.value)}
                        placeholder="book a fitting, compare models"
                      />
                    </Field>
                    <Field label="Primary keyword">
                      <Input
                        value={bulkGenerationMeta.primaryKeyword}
                        onChange={(event) => updateBulkGenerationMeta("primaryKeyword", event.target.value)}
                        placeholder="러닝화 추천"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Search intent">
                      <select
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                        value={bulkGenerationMeta.searchIntent}
                        onChange={(event) => updateBulkGenerationMeta("searchIntent", event.target.value as SearchIntent)}
                      >
                        {Object.entries(searchIntentLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="SEO keywords">
                      <Input
                        value={bulkGenerationMeta.seoKeywords.join(", ")}
                        onChange={(event) => updateBulkGenerationMeta("seoKeywords", splitCsv(event.target.value))}
                        placeholder="러닝화 추천, 발볼 넓은 러닝화, 입문 러닝화"
                      />
                    </Field>
                  </div>
                  <Field label="Must-cover sections">
                    <Textarea
                      value={joinLines(bulkGenerationMeta.mustIncludeSections)}
                      onChange={(event) => updateBulkGenerationMeta("mustIncludeSections", splitListText(event.target.value))}
                      rows={4}
                      placeholder={"핵심 요약\n선택 기준\n실수하기 쉬운 부분"}
                    />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Competitor URLs">
                      <Textarea
                        value={joinLines(bulkGenerationMeta.competitorUrls)}
                        onChange={(event) => updateBulkGenerationMeta("competitorUrls", splitListText(event.target.value))}
                        rows={4}
                        placeholder={"https://example.com/article-1\nhttps://example.com/article-2"}
                      />
                    </Field>
                    <Field label="Reference URLs">
                      <Textarea
                        value={joinLines(bulkGenerationMeta.referenceUrls)}
                        onChange={(event) => updateBulkGenerationMeta("referenceUrls", splitListText(event.target.value))}
                        rows={4}
                        placeholder={"https://trusted-source.com/report\nhttps://trusted-source.com/guide"}
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            {bulkAutoGenerate && bulkAutoSchedule ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First publish time">
                  <Input
                    type="datetime-local"
                    value={bulkScheduleStartAt}
                    onChange={(event) => setBulkScheduleStartAt(event.target.value)}
                  />
                </Field>
                <Field label="Interval hours">
                  <Input
                    type="number"
                    min={1}
                    value={bulkScheduleIntervalHours}
                    onChange={(event) => setBulkScheduleIntervalHours(Number.parseInt(event.target.value, 10) || 1)}
                  />
                </Field>
              </div>
            ) : null}
            <Field label="Titles">
              <Textarea
                value={bulkTitles}
                onChange={(event) => setBulkTitles(event.target.value)}
                rows={10}
                placeholder={"Best daily running shoes for beginners\nNike Pegasus review\nKR to US shoe size converter guide"}
              />
            </Field>
            {bulkAutoGenerate && bulkAutoSchedule ? (
              <p className="text-xs text-muted-foreground">
                Each title will be drafted immediately, auto-approved, and scheduled in sequence like a WordPress reserved post queue.
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulk(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkCreate} disabled={loading || !bulkTitles.trim()}>
                <Send className="mr-1 h-4 w-4" />
                {bulkAutoGenerate ? (bulkAutoSchedule ? "Generate and schedule" : "Generate now") : "Create drafts"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Auto publish</p>
                <p className="text-sm text-muted-foreground">Allow scheduled posts to publish automatically.</p>
              </div>
              <Switch
                checked={settings.auto_publish_enabled}
                onCheckedChange={(value) => setSettings((current) => ({ ...current, auto_publish_enabled: value }))}
              />
            </div>
            <Field label="Publish interval (hours)">
              <Input
                type="number"
                value={settings.publish_interval_hours}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    publish_interval_hours: Number.parseInt(event.target.value, 10) || 24,
                  }))
                }
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>Save settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function StatsCard({
  label,
  count,
  icon: Icon,
}: {
  label: string;
  count: number;
  icon: typeof FileText;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitListText(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(values: string[] | undefined) {
  return Array.isArray(values) ? values.join("\n") : "";
}

function hasSeoSnapshot(meta: GenerationMeta) {
  return Boolean(
    meta.refinedTitle ||
      meta.metaTitle ||
      meta.metaDescription ||
      meta.sourceUrls?.length ||
      meta.internalLinks?.length ||
      meta.qualityGate,
  );
}

function getRefinedTitle(post: BlogPost) {
  const refinedTitle = post.generation_meta?.refinedTitle?.trim();
  return refinedTitle && refinedTitle !== post.title ? refinedTitle : null;
}

function getPrimaryKeyword(post: BlogPost) {
  return post.generation_meta?.primaryKeyword?.trim() || null;
}

function getSearchIntent(post: BlogPost) {
  const value = post.generation_meta?.searchIntent;
  if (
    value === "auto" ||
    value === "informational" ||
    value === "commercial" ||
    value === "transactional" ||
    value === "comparison" ||
    value === "local"
  ) {
    return value;
  }
  return null;
}

function getQualityGate(post: BlogPost) {
  const gate = post.generation_meta?.qualityGate;
  if (!gate || typeof gate !== "object") return null;
  if (typeof gate.passed !== "boolean" || typeof gate.score !== "number") return null;

  return {
    passed: gate.passed,
    score: gate.score,
    blockers: Array.isArray(gate.blockers) ? gate.blockers.map((item) => String(item)) : [],
    warnings: Array.isArray(gate.warnings) ? gate.warnings.map((item) => String(item)) : [],
  } satisfies QualityGateSnapshot;
}

function getSourceCount(post: BlogPost) {
  return Array.isArray(post.generation_meta?.sourceUrls) ? post.generation_meta.sourceUrls.length : 0;
}

function getInternalLinkCount(post: BlogPost) {
  return Array.isArray(post.generation_meta?.internalLinks) ? post.generation_meta.internalLinks.length : 0;
}

function parseFaq(value: string) {
  if (!value.trim()) return [];

  return value
    .split("\n\n")
    .map((block) => {
      const lines = block.split("\n");
      const question = (lines.find((line) => line.startsWith("Q:")) || "").replace("Q:", "").trim();
      const answer = (lines.find((line) => line.startsWith("A:")) || "").replace("A:", "").trim();
      return { question, answer };
    })
    .filter((item) => item.question && item.answer);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 100);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocalValue(value: string | null) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoDatetime(value: string) {
  if (!value.trim()) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Unexpected error";
}

export default Admin;
