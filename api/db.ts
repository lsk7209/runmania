import { createClient } from "@libsql/client/web";

export const tursoClient = new Proxy({}, {
  get: (target, prop) => {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error("TURSO_DATABASE_URL is not set in Vercel environment variables.");
    }
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || "",
    });
    return (client as any)[prop];
  }
}) as ReturnType<typeof createClient>;
