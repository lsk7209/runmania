import { createClient } from "@libsql/client/web";

const dbUrl = "libsql://runmaina-lsk7209.aws-ap-northeast-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI2MDQxODUsImlkIjoiMDE5Y2I3NzEtNGIwMS03ZmEzLTgzZGYtZTk3MzBlYTM2N2QxIiwicmlkIjoiYzdjMjUwMjktOTljNy00NjA5LWFjYzktNzcwMTQ4MWVjZjRlIn0.S7qbQL16rtBM7-QazSMe6uTVpL_SmwoX_P0uHLwYxTGNpunFYJFx4ZfyAVi2pftXhYO3RDBVyFEcbQyVrzBWBg";

const url = dbUrl.trim().startsWith("libsql://") 
  ? dbUrl.trim().replace("libsql://", "https://") 
  : dbUrl.trim();

const client = createClient({
  url: url,
  authToken: authToken.trim(),
});

async function run() {
  try {
    const result = await client.execute("SELECT id, title FROM blog_posts ORDER BY created_at ASC");
    const posts = result.rows;
    console.log(`Found ${posts.length} posts to update with natural times.`);

    if (posts.length === 0) return;

    const now = new Date();
    // Start from approx (posts.length * 2) days ago
    let baseDate = new Date(now.getTime() - (posts.length * 2 * 24 * 60 * 60 * 1000));

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
            args: [dateStr, dateStr, dateStr, post.id]
        });
    }

    console.log("All posts updated with natural randomized times.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

run();