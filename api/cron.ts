import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Github Actions 또는 Vercel Cron을 통한 자동화 스크립트 실행 라우트
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // TODO: 크롤링 갱신 등 정기 작업 로직 수행
        console.log("Cron job executed at:", new Date().toISOString());

        return res.status(200).json({
            success: true,
            message: "Cron job executed successfully",
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "Error executing cron job" });
    }
}
