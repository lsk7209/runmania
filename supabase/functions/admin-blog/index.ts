import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SeedPost = Record<string, unknown>;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { password, action, data } = body;

    // Validate admin password
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!password || password !== adminPassword) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;

    switch (action) {
      case "list": {
        const { status } = data || {};
        let query = supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });
        if (status && status !== "all") {
          query = query.eq("status", status);
        }
        const { data: posts, error } = await query;
        if (error) throw error;
        result = posts;
        break;
      }

      case "get": {
        const { id } = data;
        const { data: post, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        result = post;
        break;
      }

      case "create": {
        const { title, slug, excerpt, content, tags, read_time, hero_image, related_slugs, faq, status: postStatus } = data;
        const { data: post, error } = await supabase
          .from("blog_posts")
          .insert({
            title,
            slug,
            excerpt,
            content: content || [],
            tags: tags || [],
            read_time,
            hero_image,
            related_slugs: related_slugs || [],
            faq: faq || [],
            status: postStatus || "draft",
          })
          .select()
          .single();
        if (error) throw error;
        result = post;
        break;
      }

      case "update": {
        const { id, ...updateData } = data;
        const { data: post, error } = await supabase
          .from("blog_posts")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = post;
        break;
      }

      case "delete": {
        const { id } = data;
        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "bulk_create": {
        // Create multiple draft posts from titles
        const { titles } = data;
        const posts = titles.map((title: string) => ({
          title,
          slug: title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣\s-]/g, "")
            .replace(/\s+/g, "-")
            .substring(0, 100),
          status: "draft",
          content: [],
          tags: [],
          faq: [],
        }));
        const { data: created, error } = await supabase
          .from("blog_posts")
          .insert(posts)
          .select();
        if (error) throw error;
        result = created;
        break;
      }

      case "seed": {
        // Seed existing hardcoded posts
        const { posts } = data;
        const { data: created, error } = await supabase
          .from("blog_posts")
          .upsert(
            posts.map((post: SeedPost) => ({
              ...post,
              status: "published",
              published_at:
                typeof post.published_at === "string" ? post.published_at : new Date().toISOString(),
            })),
            { onConflict: "slug" }
          )
          .select();
        if (error) throw error;
        result = created;
        break;
      }

      case "publish": {
        const { id } = data;
        const { data: post, error } = await supabase
          .from("blog_posts")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = post;
        break;
      }

      case "unpublish": {
        const { id } = data;
        const { data: post, error } = await supabase
          .from("blog_posts")
          .update({ status: "draft", published_at: null })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = post;
        break;
      }

      case "schedule": {
        const { id, scheduled_at } = data;
        const { data: post, error } = await supabase
          .from("blog_posts")
          .update({ status: "scheduled", scheduled_at })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = post;
        break;
      }

      case "get_settings": {
        const { data: settings, error } = await supabase
          .from("publish_settings")
          .select("*")
          .limit(1)
          .single();
        if (error) throw error;
        result = settings;
        break;
      }

      case "update_settings": {
        const { publish_interval_hours, auto_publish_enabled } = data;
        const { data: settings, error } = await supabase
          .from("publish_settings")
          .update({ publish_interval_hours, auto_publish_enabled })
          .eq(
            "id",
            (
              await supabase
                .from("publish_settings")
                .select("id")
                .limit(1)
                .single()
            ).data?.id
          )
          .select()
          .single();
        if (error) throw error;
        result = settings;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
