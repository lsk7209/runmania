type AdminPostSummary = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

const endpoint = (process.env.API_CHECK_ENDPOINT || "").trim();
const password = (process.env.API_CHECK_PASSWORD || "").trim();

async function check() {
  try {
    if (!endpoint || !password) {
      throw new Error("API_CHECK_ENDPOINT and API_CHECK_PASSWORD must be set");
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list", password }),
    });

    if (!res.ok) {
      console.error("status:", res.status, await res.text());
      return;
    }

    const posts = (await res.json()) as AdminPostSummary[];
    console.log(`Total posts returned by API: ${posts.length}`);
    console.log(posts.map((post) => ({
      id: post.id,
      title: post.title,
      status: post.status,
      created_at: post.created_at,
    })));
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error);
  }
}

check();
