import { createClient } from "@libsql/client/web";

type PostRow = {
  id: string;
  title: string;
};

const dbUrl = (process.env.TURSO_DATABASE_URL || "").trim();
const authToken = (process.env.TURSO_AUTH_TOKEN || "").trim();

if (!dbUrl || !authToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
}

const url = dbUrl.startsWith("libsql://")
  ? dbUrl.replace("libsql://", "https://")
  : dbUrl;

const client = createClient({
  url: url,
  authToken: authToken.trim(),
});

async function run() {
  try {
    const result = await client.execute("SELECT id, title FROM blog_posts ORDER BY created_at ASC");
    const posts = result.rows as PostRow[];
    console.log(`Found ${posts.length} posts to update with natural times.`);

    if (posts.length === 0) return;

    const now = new Date();
    // Start from approx (posts.length * 2) days ago
    const baseDate = new Date(now.getTime() - (posts.length * 2 * 24 * 60 * 60 * 1000));

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        
        // 2 days interval + random offset (up to 12 hours)
        const dayOffset = i * 2 * 24 * 60 * 60 * 1000;
        const randomHourOffset = Math.floor(Math.random() * 12 * 60 * 60 * 1000); 
        const randomMinuteOffset = Math.floor(Math.random() * 60 * 60 * 1000);
        
        const newDate = new Date(baseDate.getTime() + dayOffset + randomHourOffset + randomMinuteOffset);
        const dateStr = newDate.toISOString().slice(0, 19).replace('T', ' ');

        console.log(`Updating "${post.title}" -> ${dateStr}`);
        
      await client.execute({
        sql: "UPDATE blog_posts SET created_at = ?, published_at = ?, updated_at = ? WHERE id = ?",
        args: [dateStr, dateStr, dateStr, post.id],
      });
    }

    console.log("All posts updated with natural randomized times.");
  } catch (error: unknown) {
    console.error("Error:", error instanceof Error ? error.message : error);
  } finally {
    process.exit(0);
  }
}

run();
