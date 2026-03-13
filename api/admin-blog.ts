import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateContentForPost } from "./admin-generate.js";
import { ensureContentSchema, tursoClient } from "./db.js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

type ParsedPostRow = {
  content: unknown;
  tags: unknown;
  related_slugs: unknown;
  faq: unknown;
  generation_meta: unknown;
  [key: string]: unknown;
};

type PostMutationInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown[];
  tags: unknown[];
  read_time: string | null;
  hero_image: string | null;
  related_slugs: unknown[];
  faq: unknown[];
  status: "draft" | "scheduled" | "published";
  content_type: string;
  workflow_status: "idea" | "reviewing" | "approved";
  generation_meta: Record<string, unknown>;
  scheduled_at: string | null;
};

type PostMutationValidation =
  | { ok: true; value: PostMutationInput }
  | { ok: false; status: number; error: string };

type PublishWorkflowRow = {
  id: string;
  workflow_status?: string | null;
  status?: string | null;
};

type SettingsRow = {
  publish_interval_hours?: number | string | null;
  auto_publish_enabled?: boolean | number | string | null;
};

type SeedPost = Record<string, unknown>;
type BulkPipelineResult = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "scheduled";
  workflow_status: "idea" | "reviewing" | "approved";
  scheduled_at: string | null;
  error: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password, action, data } = req.body || {};
  const envPass = (ADMIN_PASSWORD || "").trim();
  const inputPass = (password || "").trim();

  if (!envPass) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not configured" });
  }

  if (inputPass !== envPass) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await ensureContentSchema();

    switch (action) {
      case "list": {
        const status = data?.status || "all";
        const sql =
          status === "all"
            ? "SELECT * FROM blog_posts ORDER BY updated_at DESC, created_at DESC"
            : "SELECT * FROM blog_posts WHERE status = ? ORDER BY updated_at DESC, created_at DESC";
        const result =
          status === "all"
            ? await tursoClient.execute(sql)
            : await tursoClient.execute({ sql, args: [status] });

        return res.status(200).json(result.rows.map(parsePost));
      }

      case "create": {
        const normalized = validatePostMutation(data);
        if (!normalized.ok) {
          return res.status(normalized.status).json({ error: normalized.error });
        }

        const post = normalized.value;
        const id = crypto.randomUUID();
        await tursoClient.execute({
          sql: `INSERT INTO blog_posts
            (id, title, slug, excerpt, content, tags, read_time, hero_image, related_slugs, faq,
             status, content_type, workflow_status, generation_meta, scheduled_at, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
          args: [
            id,
            post.title,
            post.slug,
            post.excerpt,
            JSON.stringify(post.content),
            JSON.stringify(post.tags),
            post.read_time,
            post.hero_image,
            JSON.stringify(post.related_slugs),
            JSON.stringify(post.faq),
            post.status,
            post.content_type,
            post.workflow_status,
            JSON.stringify(post.generation_meta),
            post.scheduled_at,
          ],
        });
        return res.status(200).json({ id, slug: post.slug });
      }

      case "update": {
        const normalized = validatePostMutation(data);
        if (!normalized.ok) {
          return res.status(normalized.status).json({ error: normalized.error });
        }

        const post = normalized.value;
        await tursoClient.execute({
          sql: `UPDATE blog_posts SET
            title=?, slug=?, excerpt=?, content=?, tags=?, read_time=?, hero_image=?,
            related_slugs=?, faq=?, status=?, content_type=?, workflow_status=?, generation_meta=?, scheduled_at=?,
            updated_at=CURRENT_TIMESTAMP
            WHERE id=?`,
          args: [
            post.title,
            post.slug,
            post.excerpt,
            JSON.stringify(post.content),
            JSON.stringify(post.tags),
            post.read_time,
            post.hero_image,
            JSON.stringify(post.related_slugs),
            JSON.stringify(post.faq),
            post.status,
            post.content_type,
            post.workflow_status,
            JSON.stringify(post.generation_meta),
            post.scheduled_at,
            data.id,
          ],
        });
        return res.status(200).json({ success: true });
      }

      case "delete": {
        await tursoClient.execute({
          sql: "DELETE FROM blog_posts WHERE id = ?",
          args: [data.id],
        });
        return res.status(200).json({ success: true });
      }

      case "publish": {
        const result = await tursoClient.execute({
          sql: "SELECT id, workflow_status FROM blog_posts WHERE id = ?",
          args: [data.id],
        });

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Post not found" });
        }

        const post = result.rows[0] as PublishWorkflowRow;
        if (post.workflow_status !== "approved") {
          return res.status(409).json({ error: "Only approved posts can be published" });
        }

        await tursoClient.execute({
          sql: `UPDATE blog_posts
            SET status='published', published_at=CURRENT_TIMESTAMP, scheduled_at=NULL, updated_at=CURRENT_TIMESTAMP
            WHERE id=?`,
          args: [data.id],
        });
        return res.status(200).json({ success: true });
      }

      case "unpublish": {
        await tursoClient.execute({
          sql: `UPDATE blog_posts
            SET status='draft', published_at=NULL, scheduled_at=NULL, updated_at=CURRENT_TIMESTAMP
            WHERE id=?`,
          args: [data.id],
        });
        return res.status(200).json({ success: true });
      }

      case "update_workflow": {
        const result = await tursoClient.execute({
          sql: "SELECT id, status FROM blog_posts WHERE id = ?",
          args: [data.id],
        });

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Post not found" });
        }

        const post = result.rows[0] as PublishWorkflowRow;
        if (post.status === "published" && data.workflow_status !== "approved") {
          return res.status(409).json({
            error: "Published posts must be moved back to draft before changing workflow",
          });
        }

        if (post.status === "scheduled" && data.workflow_status !== "approved") {
          return res.status(409).json({
            error: "Scheduled posts must stay approved or be moved back to draft first",
          });
        }

        await tursoClient.execute({
          sql: `UPDATE blog_posts SET workflow_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
          args: [data.workflow_status ?? "idea", data.id],
        });
        return res.status(200).json({ success: true });
      }

      case "bulk_create": {
        const titles: string[] = data.titles ?? [];
        const createdIds: string[] = [];
        const reservedSlugs = new Set<string>();

        for (const title of titles) {
          const id = crypto.randomUUID();
          const slug = await resolveUniqueSlug(slugify(title), reservedSlugs);
          await tursoClient.execute({
            sql: `INSERT INTO blog_posts
              (id, title, slug, content, tags, related_slugs, faq, status, content_type, workflow_status, generation_meta, created_at, updated_at)
              VALUES (?,?,?, '[]', '[]', '[]', '[]', 'draft', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            args: [
              id,
              title,
              slug,
              data.content_type ?? "blog",
              "idea",
              JSON.stringify(data.generation_meta ?? defaultGenerationMeta()),
            ],
          });
          createdIds.push(id);
        }

        return res.status(200).json({ created: titles.length, ids: createdIds });
      }

      case "bulk_pipeline": {
        const titles = Array.isArray(data.titles)
          ? data.titles.map((item: unknown) => String(item).trim()).filter(Boolean)
          : [];

        if (titles.length === 0) {
          return res.status(400).json({ error: "At least one title is required" });
        }

        const contentType = String(data.content_type ?? "blog").trim() || "blog";
        const generationMeta = {
          ...defaultGenerationMeta(),
          ...(isPlainObject(data.generation_meta) ? data.generation_meta : {}),
          contentType,
        };
        const autoGenerate = data.auto_generate !== false;
        const autoSchedule = data.auto_schedule !== false;
        const firstScheduledAt = autoSchedule ? normalizeScheduledAt(data.first_scheduled_at) : null;
        const scheduleIntervalHours = autoSchedule
          ? normalizePositiveNumber(data.schedule_interval_hours) ?? (await getDefaultPublishIntervalHours())
          : null;

        if (autoSchedule && !firstScheduledAt) {
          return res.status(400).json({ error: "first_scheduled_at is required for auto scheduling" });
        }

        if (autoSchedule && !scheduleIntervalHours) {
          return res.status(400).json({ error: "schedule_interval_hours must be greater than 0" });
        }

        const createdIds: string[] = [];
        const results: BulkPipelineResult[] = [];
        const reservedSlugs = new Set<string>();

        for (let index = 0; index < titles.length; index += 1) {
          const title = titles[index];
          const id = crypto.randomUUID();
          const slug = await resolveUniqueSlug(slugify(title), reservedSlugs);
          let status: BulkPipelineResult["status"] = "draft";
          let workflowStatus: BulkPipelineResult["workflow_status"] = "idea";
          let scheduledAt: string | null = null;
          let error: string | null = null;

          await tursoClient.execute({
            sql: `INSERT INTO blog_posts
              (id, title, slug, content, tags, related_slugs, faq, status, content_type, workflow_status, generation_meta, created_at, updated_at)
              VALUES (?,?,?, '[]', '[]', '[]', '[]', 'draft', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            args: [
              id,
              title,
              slug,
              contentType,
              "idea",
              JSON.stringify(generationMeta),
            ],
          });
          createdIds.push(id);

          if (autoGenerate) {
            try {
              const generationResult = await generateContentForPost({
                postId: id,
                options: generationMeta,
              });

              if (generationResult.qualityGate.passed) {
                workflowStatus = "approved";
                if (autoSchedule && firstScheduledAt && scheduleIntervalHours) {
                  scheduledAt = addHours(firstScheduledAt, scheduleIntervalHours * index);
                  status = "scheduled";
                }

                await tursoClient.execute({
                  sql: `UPDATE blog_posts
                    SET status=?, workflow_status='approved', scheduled_at=?, updated_at=CURRENT_TIMESTAMP
                    WHERE id=?`,
                  args: [status, scheduledAt, id],
                });
              } else {
                workflowStatus = "reviewing";
                error = generationResult.qualityGate.blockers.join(" | ") || "Quality gate failed";
              }
            } catch (bulkError: unknown) {
              error = getErrorMessage(bulkError, "Failed to generate content");
            }
          }

          results.push({
            id,
            title,
            slug,
            status,
            workflow_status: workflowStatus,
            scheduled_at: scheduledAt,
            error,
          });
        }

        return res.status(200).json({
          created: createdIds.length,
          generated: results.filter((item) => item.workflow_status === "approved").length,
          scheduled: results.filter((item) => item.status === "scheduled").length,
          failed: results.filter((item) => item.error).length,
          ids: createdIds,
          results,
        });
      }

      case "seed": {
        const posts: SeedPost[] = Array.isArray(data.posts) ? data.posts : [];
        let upserted = 0;

        for (const post of posts) {
          const id = crypto.randomUUID();
          await tursoClient.execute({
            sql: `INSERT INTO blog_posts
              (id, title, slug, excerpt, content, tags, read_time, hero_image,
               related_slugs, faq, status, published_at, content_type, workflow_status, generation_meta, created_at, updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?, 'published', CURRENT_TIMESTAMP, 'blog', 'approved', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT(slug) DO UPDATE SET
                title=excluded.title, excerpt=excluded.excerpt, content=excluded.content,
                tags=excluded.tags, read_time=excluded.read_time, hero_image=excluded.hero_image,
                related_slugs=excluded.related_slugs, faq=excluded.faq, updated_at=CURRENT_TIMESTAMP`,
            args: [
              id,
              post.title,
              post.slug,
              post.excerpt ?? null,
              JSON.stringify(post.content ?? []),
              JSON.stringify(post.tags ?? []),
              post.readTime ?? post.read_time ?? null,
              post.heroImagePath ?? post.hero_image ?? null,
              JSON.stringify(post.relatedSlugs ?? post.related_slugs ?? []),
              JSON.stringify(post.faq ?? []),
            ],
          });
          upserted++;
        }

        return res.status(200).json({ upserted });
      }

      case "get_generation_logs": {
        const result = await tursoClient.execute(
          "SELECT * FROM content_generation_logs ORDER BY created_at DESC LIMIT 30",
        );
        const logs = result.rows.map((row) => ({
          ...row,
          requested_prompt: tryParse((row as Record<string, unknown>).requested_prompt),
        }));
        return res.status(200).json(logs);
      }

      case "get_settings": {
        const result = await tursoClient.execute("SELECT * FROM app_settings WHERE id = 1");
        const row = result.rows[0] as SettingsRow | undefined;
        return res.status(200).json(
          row
            ? {
                publish_interval_hours: row.publish_interval_hours ?? 24,
                auto_publish_enabled: Boolean(row.auto_publish_enabled ?? 1),
              }
            : { publish_interval_hours: 24, auto_publish_enabled: true },
        );
      }

      case "update_settings": {
        await tursoClient.execute({
          sql: `INSERT INTO app_settings (id, publish_interval_hours, auto_publish_enabled, updated_at)
            VALUES (1, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              publish_interval_hours=excluded.publish_interval_hours,
              auto_publish_enabled=excluded.auto_publish_enabled,
              updated_at=CURRENT_TIMESTAMP`,
          args: [data.publish_interval_hours ?? 24, data.auto_publish_enabled ? 1 : 0],
        });
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error: unknown) {
    console.error(`[admin-blog] action=${action}`, error);
    return res.status(500).json({ error: getErrorMessage(error, "Internal Server Error") });
  }
}

function parsePost(row: ParsedPostRow) {
  return {
    ...row,
    content: tryParse(row.content),
    tags: tryParse(row.tags),
    related_slugs: tryParse(row.related_slugs),
    faq: tryParse(row.faq),
    generation_meta: tryParse(row.generation_meta),
  };
}

function tryParse(val: unknown) {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 100);
}

function defaultGenerationMeta() {
  return {
    template: "guide",
    targetAudience: "",
    tone: "expert",
    length: "medium",
    seoKeywords: [],
    cta: "",
    primaryKeyword: "",
    searchIntent: "auto",
    competitorUrls: [],
    referenceUrls: [],
    mustIncludeSections: [],
  };
}

async function getDefaultPublishIntervalHours() {
  const result = await tursoClient.execute("SELECT publish_interval_hours FROM app_settings WHERE id = 1");
  const row = result.rows[0] as SettingsRow | undefined;
  return normalizePositiveNumber(row?.publish_interval_hours) ?? 24;
}

function validatePostMutation(data: unknown): PostMutationValidation {
  const source = isPlainObject(data) ? data : {};
  const status = normalizeStatus(source.status);
  const workflowStatus = normalizeWorkflowStatus(source.workflow_status);
  const scheduledAt = status === "scheduled" ? normalizeScheduledAt(source.scheduled_at) : null;

  if (status === "scheduled" && workflowStatus !== "approved") {
    return {
      ok: false,
      status: 409,
      error: "Scheduled posts must be approved before scheduling",
    };
  }

  if (status === "scheduled" && !scheduledAt) {
    return {
      ok: false,
      status: 400,
      error: "Scheduled posts require scheduled_at",
    };
  }

  return {
    ok: true,
    value: {
      title: String(source.title ?? "").trim(),
      slug: String(source.slug ?? "").trim(),
      excerpt: normalizeNullableString(source.excerpt),
      content: Array.isArray(source.content) ? source.content : [],
      tags: Array.isArray(source.tags) ? source.tags : [],
      read_time: normalizeNullableString(source.read_time),
      hero_image: normalizeNullableString(source.hero_image),
      related_slugs: Array.isArray(source.related_slugs) ? source.related_slugs : [],
      faq: Array.isArray(source.faq) ? source.faq : [],
      status,
      content_type: String(source.content_type ?? "blog").trim() || "blog",
      workflow_status: workflowStatus,
      generation_meta: isPlainObject(source.generation_meta) ? source.generation_meta : defaultGenerationMeta(),
      scheduled_at: scheduledAt,
    },
  };
}

function normalizeStatus(value: unknown): PostMutationInput["status"] {
  return value === "scheduled" || value === "published" ? value : "draft";
}

function normalizeWorkflowStatus(value: unknown): PostMutationInput["workflow_status"] {
  return value === "reviewing" || value === "approved" ? value : "idea";
}

function normalizeNullableString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

function normalizeScheduledAt(value: unknown) {
  const normalized = normalizeNullableString(value);
  if (!normalized) return null;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizePositiveNumber(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function addHours(isoString: string, hours: number) {
  const date = new Date(isoString);
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date.toISOString();
}

async function resolveUniqueSlug(baseSlug: string, reservedSlugs: Set<string>) {
  const normalizedBase = baseSlug || `post-${crypto.randomUUID().slice(0, 8)}`;
  let candidate = normalizedBase;
  let suffix = 2;

  while (reservedSlugs.has(candidate) || (await slugExists(candidate))) {
    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  reservedSlugs.add(candidate);
  return candidate;
}

async function slugExists(slug: string) {
  const result = await tursoClient.execute({
    sql: "SELECT id FROM blog_posts WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  return result.rows.length > 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
