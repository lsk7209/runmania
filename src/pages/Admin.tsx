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

interface GenerationMeta {
  template: string;
  targetAudience: string;
  tone: string;
  length: string;
  seoKeywords: string[];
  cta: string;
  contentType?: ContentType;
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

const defaultGenerationMeta = (): GenerationMeta => ({
  template: "guide",
  targetAudience: "",
  tone: "expert",
  length: "medium",
  seoKeywords: [],
  cta: "",
  contentType: "blog",
});

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

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | PublishStatus>("all");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bulkTitles, setBulkTitles] = useState("");
  const [bulkContentType, setBulkContentType] = useState<ContentType>("blog");
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
    } catch (error: any) {
      toast({ title: "Failed to load admin data", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [loadLogs, loadPosts, loadSettings]);

  useEffect(() => {
    if (authenticated) {
      refreshAll();
    }
  }, [authenticated, refreshAll]);

  useEffect(() => {
    if (authenticated) {
      loadPosts().catch((error: any) => {
        toast({ title: "Failed to refresh posts", description: error.message, variant: "destructive" });
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
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
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

  const handleSave = async () => {
    if (!form.title.trim()) return;

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
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (post: BlogPost) => {
    setLoading(true);
    try {
      await generateContent(password, post.id, post.generation_meta || {});
      toast({ title: "AI draft generated", description: "Workflow moved to Reviewing." });
      await refreshAll();
    } catch (error: any) {
      toast({ title: "AI generation failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post?")) return;

    setLoading(true);
    try {
      await adminCall(password, "delete", { id });
      toast({ title: "Post deleted" });
      await refreshAll();
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    setLoading(true);
    try {
      await adminCall(password, "publish", { id });
      toast({ title: "Post published" });
      await refreshAll();
    } catch (error: any) {
      toast({ title: "Publish failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (id: string) => {
    setLoading(true);
    try {
      await adminCall(password, "unpublish", { id });
      toast({ title: "Moved back to draft" });
      await refreshAll();
    } catch (error: any) {
      toast({ title: "Unpublish failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowUpdate = async (id: string, workflowStatus: WorkflowStatus) => {
    setLoading(true);
    try {
      await adminCall(password, "update_workflow", { id, workflow_status: workflowStatus });
      toast({ title: `Workflow set to ${workflowLabels[workflowStatus]}` });
      await refreshAll();
    } catch (error: any) {
      toast({ title: "Workflow update failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    const titles = bulkTitles
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (titles.length === 0) return;

    setLoading(true);
    try {
      const generationMeta = {
        ...defaultGenerationMeta(),
        contentType: bulkContentType,
      };
      await adminCall(password, "bulk_create", {
        titles,
        content_type: bulkContentType,
        generation_meta: generationMeta,
      });
      toast({ title: `${titles.length} drafts created` });
      setBulkTitles("");
      setShowBulk(false);
      await refreshAll();
    } catch (error: any) {
      toast({ title: "Bulk create failed", description: error.message, variant: "destructive" });
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
    } catch (error: any) {
      toast({ title: "Seed import failed", description: error.message, variant: "destructive" });
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
    } catch (error: any) {
      toast({ title: "Settings update failed", description: error.message, variant: "destructive" });
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
          <Button variant="outline" size="sm" onClick={() => setShowBulk(true)}>
            <FileText className="mr-1 h-4 w-4" />
            Bulk drafts
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
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditor(post)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleGenerate(post)} title="Generate AI">
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWorkflowUpdate(post.id, "reviewing")}
                            disabled={post.workflow_status === "reviewing"}
                          >
                            Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWorkflowUpdate(post.id, "approved")}
                            disabled={post.workflow_status === "approved"}
                          >
                            Approve
                          </Button>
                          {post.status !== "published" ? (
                            <Button variant="ghost" size="icon" onClick={() => handlePublish(post.id)} title="Publish">
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleUnpublish(post.id)} title="Unpublish">
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} title="Delete">
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      Template: {String(log.requested_prompt.template || "guide")} / Tone:{" "}
                      {String(log.requested_prompt.tone || "expert")}
                    </p>
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
                  onChange={(event) => updateForm("status", event.target.value as PublishStatus)}
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
                <div className="grid gap-4 md:grid-cols-3">
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
                </div>
                <Field label="SEO keywords">
                  <Input
                    value={form.generationMeta.seoKeywords.join(", ")}
                    onChange={(event) => updateGenerationMeta("seoKeywords", splitCsv(event.target.value))}
                    placeholder="러닝화 추천, 발볼 넓은 러닝화"
                  />
                </Field>
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
            <DialogTitle>Bulk draft creation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Content type">
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={bulkContentType}
                onChange={(event) => setBulkContentType(event.target.value as ContentType)}
              >
                <option value="blog">Blog</option>
                <option value="review">Review</option>
                <option value="utility">Utility</option>
              </select>
            </Field>
            <Field label="Titles">
              <Textarea
                value={bulkTitles}
                onChange={(event) => setBulkTitles(event.target.value)}
                rows={10}
                placeholder={"Best daily running shoes for beginners\nNike Pegasus review\nKR to US shoe size converter guide"}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulk(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkCreate} disabled={loading || !bulkTitles.trim()}>
                <Send className="mr-1 h-4 w-4" />
                Create drafts
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

export default Admin;
