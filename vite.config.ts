import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import querystring from "querystring";
import type { IncomingMessage, ServerResponse } from "http";
import { componentTagger } from "lovable-tagger";

/* ── Sitemap auto-generation plugin ── */
function sitemapPlugin(): Plugin {
  return {
    name: "vite-plugin-sitemap",
    closeBundle() {
      const outPath = path.resolve(__dirname, "dist/sitemap.xml");
      if (fs.existsSync(outPath)) fs.rmSync(outPath);
      console.log("✅ sitemap.xml served dynamically from /api/sitemap");
    },
  };
}

/* ── IndexNow auto-ping plugin ── */
function indexNowPlugin(): Plugin {
  const INDEXNOW_KEY =
    process.env.INDEXNOW_KEY ?? "b1c3e5a7d9f2e4b6a8c0d2e4f6a8b0c1";
  const BASE_URL = "https://runmania.kr";

  return {
    name: "vite-plugin-indexnow",
    async closeBundle() {
      try {
        const sitemapXml = await loadSitemapXml(BASE_URL);
        const locRe = /<loc>([^<]+)<\/loc>/g;
        const urlList: string[] = [];
        let match: RegExpExecArray | null;
        while ((match = locRe.exec(sitemapXml)) !== null) {
          urlList.push(match[1]);
        }

        if (urlList.length === 0) {
          console.warn("⚠️ IndexNow skipped: no URLs found in sitemap");
          return;
        }

        // 1. IndexNow ping (Bing + Naver 직접 제출)
        const indexNowBody = {
          host: "runmania.kr",
          key: INDEXNOW_KEY,
          keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
          urlList,
        };

        const endpoints = [
          "https://api.indexnow.org/indexnow",
          "https://www.bing.com/indexnow",
          "https://searchadvisor.naver.com/indexnow",
        ];
        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json; charset=utf-8" },
              body: JSON.stringify(indexNowBody),
            }),
          ),
        );

        console.log(
          `✅ IndexNow ping sent: ${responses.map((res) => res.status).join(", ")} (${urlList.length} URLs)`,
        );

        // Google ping은 2023년 deprecate됨 → GSC에서 직접 제출 권장
      } catch (e) {
        console.warn("⚠️ IndexNow ping failed (build continues):", e);
      }
    },
  };
}

/* ── RSS feed auto-generation plugin ── */
function rssPlugin(): Plugin {
  return {
    name: "vite-plugin-rss",
    closeBundle() {
      const outPath = path.resolve(__dirname, "dist/rss.xml");
      if (fs.existsSync(outPath)) fs.rmSync(outPath);
      console.log("✅ rss.xml served dynamically from /api/rss");
    },
  };
}

async function loadSitemapXml(baseUrl: string) {
  const sitemapPath = path.resolve(__dirname, "dist/sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    return fs.readFileSync(sitemapPath, "utf-8");
  }

  const response = await fetch(`${baseUrl}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dynamic sitemap: ${response.status}`);
  }
  return response.text();
}

function devApiPlugin(): Plugin {
  return {
    name: "vite-plugin-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? new URL(req.url, "http://127.0.0.1") : null;
        if (!url || !url.pathname.startsWith("/api/")) {
          return next();
        }

        const modulePath = `${url.pathname}.ts`;
        const absoluteModulePath = path.resolve(__dirname, `.${modulePath}`);
        if (!fs.existsSync(absoluteModulePath)) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "API route not found" }));
          return;
        }

        try {
          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod?.default;

          if (typeof handler !== "function") {
            throw new Error(`API handler not found for ${url.pathname}`);
          }

          const bodyText = await readRequestBody(req);
          const adaptedReq = req as IncomingMessage & {
            body?: unknown;
            query?: Record<string, string>;
          };
          adaptedReq.body = parseRequestBody(req, bodyText);
          adaptedReq.query = Object.fromEntries(url.searchParams.entries());

          const adaptedRes = createVercelLikeResponse(res);
          await handler(adaptedReq, adaptedRes);

          if (!res.writableEnded) {
            res.end();
          }
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          console.error(`[dev-api] ${url.pathname}`, error);

          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                error:
                  error instanceof Error
                    ? error.message
                    : "Internal Server Error",
              }),
            );
          }
        }
      });
    },
  };
}

function createVercelLikeResponse(res: ServerResponse) {
  const adaptedRes = res as ServerResponse & {
    status: (code: number) => typeof adaptedRes;
    json: (payload: unknown) => typeof adaptedRes;
    send: (payload: unknown) => typeof adaptedRes;
  };

  adaptedRes.status = (code: number) => {
    adaptedRes.statusCode = code;
    return adaptedRes;
  };

  adaptedRes.json = (payload: unknown) => {
    if (!adaptedRes.headersSent) {
      adaptedRes.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    adaptedRes.end(JSON.stringify(payload));
    return adaptedRes;
  };

  adaptedRes.send = (payload: unknown) => {
    if (
      typeof payload === "object" &&
      payload !== null &&
      !Buffer.isBuffer(payload)
    ) {
      return adaptedRes.json(payload);
    }
    adaptedRes.end(payload as string | Buffer | Uint8Array);
    return adaptedRes;
  };

  return adaptedRes;
}

async function readRequestBody(req: IncomingMessage) {
  if (req.method === "GET" || req.method === "HEAD") {
    return "";
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
}

function parseRequestBody(req: IncomingMessage, bodyText: string) {
  if (!bodyText) {
    return undefined;
  }

  const contentType = String(req.headers["content-type"] || "");
  if (contentType.includes("application/json")) {
    return JSON.parse(bodyText);
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return querystring.parse(bodyText);
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return bodyText;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);
  const shouldSubmitIndexNow = env.SUBMIT_INDEXNOW === "true";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      devApiPlugin(),
      mode === "development" && componentTagger(),
      sitemapPlugin(),
      shouldSubmitIndexNow && indexNowPlugin(),
      rssPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
