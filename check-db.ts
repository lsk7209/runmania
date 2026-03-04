import { createClient } from "@libsql/client/web";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  console.error("Missing DB credentials");
  process.exit(1);
}

const url = dbUrl.trim().startsWith("libsql://") 
  ? dbUrl.trim().replace("libsql://", "https://") 
  : dbUrl.trim();

const client = createClient({
  url: url,
  authToken: authToken.trim(),
});

async function run() {
  try {
    const result = await client.execute("SELECT id, title, status, created_at FROM blog_posts ORDER BY created_at DESC");
    console.log(`Total posts visible in Turso DB: ${result.rows.length}`);
    console.table(result.rows);
  } catch (error) {
    console.error(error);
  }
}

run();