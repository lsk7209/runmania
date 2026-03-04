import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawUrl = process.env.TURSO_DATABASE_URL || "(not set)";
  const converted = rawUrl.startsWith("libsql://")
    ? rawUrl.replace("libsql://", "https://")
    : rawUrl;

  return res.status(200).json({
    rawUrl,
    converted,
    authTokenLength: (process.env.TURSO_AUTH_TOKEN || "").length,
    adminPasswordSet: !!process.env.ADMIN_PASSWORD,
    geminiApiKeySet: !!process.env.GEMINI_API_KEY,
    geminiApiKeyLength: (process.env.GEMINI_API_KEY || "").length,
  });
}
