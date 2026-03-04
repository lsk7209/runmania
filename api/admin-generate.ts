import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { password, postId } = req.body || {};

    // Auth check
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD.trim()) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!postId) {
        return res.status(400).json({ error: "postId is required" });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    try {
        // Fetch the draft post
        const resultPost = await tursoClient.execute({
            sql: "SELECT * FROM blog_posts WHERE id = ?",
            args: [postId]
        });

        if (resultPost.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        const post = resultPost.rows[0] as any;
        const topic = post.title;

        // Init Gemini
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
당신은 한국 최고의 러닝화 및 마라톤 전문가입니다. 
다음 주제(제목)로 전문적이고 SEO에 최적화된 블로그 글을 작성해 주세요.
주제: "${topic}"

응답은 반드시 유효한 JSON 형식으로 출력해야 합니다. 마크다운 코드 블록(\`\`\`json ... \`\`\`)을 포함하지 말고 순수 JSON 객체만 반환하세요.
JSON 구조는 다음과 같아야 합니다:
{
  "excerpt": "글의 요약 (1~2문장)",
  "content": [
    "첫 번째 문단...",
    "## 소제목 1",
    "[HIGHLIGHT]중요한 내용 강조[/HIGHLIGHT]",
    "문단 내용...",
    "[TABLE]컬럼1|컬럼2\\n값1|값2[/TABLE]",
    "[WARNING]경고 내용[/WARNING]",
    "[TIP]팁 내용[/TIP]",
    "[CHECKLIST]체크리스트 내용 1\\n체크리스트 내용 2[/CHECKLIST]"
  ],
  "tags": ["태그1", "태그2", "태그3"],
  "read_time": "10분",
  "hero_image": "/assets/shoes/nb-1080.png",
  "faq": [
    { "question": "질문 1?", "answer": "답변 1" },
    { "question": "질문 2?", "answer": "답변 2" }
  ]
}

주의사항:
1. content 배열은 각 문단, 소제목, 특별 요소들을 각각의 문자열로 분리해야 합니다.
2. hero_image는 다음 중 하나를 선택하세요: "/assets/shoes/nb-1080.png", "/assets/shoes/nb-more.png", "/assets/shoes/asics-kayano.png", "/assets/shoes/hoka-bondi.png", "/assets/shoes/nike-pegasus.png", "/assets/shoes/saucony-speed.png"
3. 글의 길이는 최소 10개의 content 블록 이상으로 상세하고 매우 전문적으로 작성해 주세요.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean up text if it contains markdown JSON blocks
        let cleanText = text.trim();
        if (cleanText.startsWith("\`\`\`json")) {
            cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith("\`\`\`")) {
            cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith("\`\`\`")) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
        }

        const parsedContent = JSON.parse(cleanText);

        // Update the database
        await tursoClient.execute({
            sql: `UPDATE blog_posts SET
                  excerpt=?, content=?, tags=?, read_time=?, hero_image=?, faq=?, updated_at=CURRENT_TIMESTAMP
                  WHERE id=?`,
            args: [
                parsedContent.excerpt || "",
                JSON.stringify(parsedContent.content || []),
                JSON.stringify(parsedContent.tags || []),
                parsedContent.read_time || "10분",
                parsedContent.hero_image || "/assets/shoes/nb-1080.png",
                JSON.stringify(parsedContent.faq || []),
                postId
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Content successfully generated and saved.",
            postId: postId
        });

    } catch (error: any) {
        console.error("[admin-generate] Error generating content:", error);
        return res.status(500).json({ error: error.message || "Failed to generate content" });
    }
}
