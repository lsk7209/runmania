import { createClient } from "@libsql/client/web";
import * as fs from "fs";
import { getHardcodedPosts } from "./src/data/blogSeedData"; // Make sure to use .ts if possible, or wait! Let's just fetch it using our new API route since we implemented a 'seed' action!

// We can just use the admin API route locally to seed!
async function seedData() {
    console.log("Seeding data via admin API...");

    // Actually, to call the API route, the Next.js/Vite dev server needs to be running.
    // We can just connect to DB directly here.

    const envFile = fs.readFileSync(".env.local", "utf-8");
    const envVars = envFile.split("\n").reduce((acc, line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
            acc[key.trim()] = valueParts.join("=").trim();
        }
        return acc;
    }, {} as Record<string, string>);

    const url = envVars["TURSO_DATABASE_URL"];
    const authToken = envVars["TURSO_AUTH_TOKEN"];

    const client = createClient({ url, authToken });

    const posts = getHardcodedPosts();
    let upserted = 0;

    for (const post of posts) {
        const id = crypto.randomUUID();
        await client.execute({
            sql: `INSERT INTO blog_posts
              (id, title, slug, excerpt, content, tags, read_time, hero_image,
               related_slugs, faq, status, published_at, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
                post.readTime ?? null,
                post.heroImagePath ?? null,
                JSON.stringify(post.relatedSlugs ?? []),
                JSON.stringify(post.faq ?? []),
            ],
        });
        upserted++;
    }

    console.log(`Seeded ${upserted} posts successfully!`);
}

seedData().catch(console.error);
