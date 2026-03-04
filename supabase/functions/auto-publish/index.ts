import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Check if auto-publish is enabled
    const { data: settings } = await supabase
      .from("publish_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings?.auto_publish_enabled) {
      return new Response(
        JSON.stringify({ message: "Auto-publish is disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const intervalHours = settings.publish_interval_hours || 24;

    // 2. Publish scheduled posts whose scheduled_at has passed
    const now = new Date().toISOString();
    const { data: publishedPosts, error: publishError } = await supabase
      .from("blog_posts")
      .update({
        status: "published",
        published_at: now,
      })
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .select();

    if (publishError) throw publishError;

    // 3. Auto-schedule draft posts
    // Find the last published or scheduled post time
    const { data: lastPost } = await supabase
      .from("blog_posts")
      .select("scheduled_at, published_at")
      .or("status.eq.published,status.eq.scheduled")
      .order("scheduled_at", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    const lastTime = lastPost?.scheduled_at || lastPost?.published_at || now;

    // Find unscheduled drafts (ordered by creation)
    const { data: drafts } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("status", "draft")
      .is("scheduled_at", null)
      .order("created_at", { ascending: true });

    if (drafts && drafts.length > 0) {
      let nextTime = new Date(lastTime);

      for (const draft of drafts) {
        nextTime = new Date(nextTime.getTime() + intervalHours * 60 * 60 * 1000);
        await supabase
          .from("blog_posts")
          .update({
            status: "scheduled",
            scheduled_at: nextTime.toISOString(),
          })
          .eq("id", draft.id);
      }
    }

    return new Response(
      JSON.stringify({
        published: publishedPosts?.length || 0,
        scheduled: drafts?.length || 0,
        message: `Published ${publishedPosts?.length || 0} posts, scheduled ${drafts?.length || 0} drafts`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
