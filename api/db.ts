import { createClient } from "@libsql/client/web";

// @libsql/client/web requires https:// not libsql://
function fixUrl(url: string): string {
  if (url.startsWith("libsql://")) {
    return url.replace("libsql://", "https://");
  }
  return url;
}

export function getDb() {
  const rawUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!rawUrl) {
    throw new Error("TURSO_DATABASE_URL is not set in Vercel environment variables.");
  }
  return createClient({ url: fixUrl(rawUrl), authToken: authToken || "" });
}

export const tursoClient = {
  execute: (...args: any[]) => getDb().execute(...(args as [any])),
  batch: (...args: any[]) => getDb().batch(...(args as [any])),
};
