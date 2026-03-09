import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
  const providedPassword = String(req.query.password || req.headers["x-admin-password"] || "").trim();

  if (!adminPassword) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not configured" });
  }

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({
    adminPasswordSet: !!process.env.ADMIN_PASSWORD,
    tursoDatabaseUrlSet: !!process.env.TURSO_DATABASE_URL,
    tursoAuthTokenSet: !!process.env.TURSO_AUTH_TOKEN,
    geminiApiKeySet: !!process.env.GEMINI_API_KEY,
    geminiApiKeyLength: (process.env.GEMINI_API_KEY || "").length,
  });
}
