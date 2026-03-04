const endpoint = "https://runmania.vercel.app/api/admin-blog";
const password = "admin1234";

async function check() {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list", password })
    });
    
    if (!res.ok) {
        console.error("status:", res.status, await res.text());
        return;
    }

    const posts = await res.json();
    console.log(`Total posts returned by API: ${posts.length}`);
    console.log(posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at
    })));
  } catch (err) {
    console.error(err);
  }
}

check();