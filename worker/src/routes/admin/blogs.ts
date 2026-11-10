import { Env, BlogDetailDto } from "../../types";
import { jsonResponse, errorResponse } from "../../middleware/error";

interface BlogRow {
  id: string;
  title: string;
  category: string;
  read_time: string;
  date: string;
  publish_date_iso: string;
  author: string;
  image: string;
  excerpt: string;
  featured: number;
}

interface IdRow {
  id: number;
}

interface BlogKeywordRow extends IdRow {
  keyword: string;
}

interface BlogTakeawayRow extends IdRow {
  takeaway: string;
}

interface BlogContentRow extends IdRow {
  paragraph: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchFullBlog(env: Env, post: BlogRow): Promise<BlogDetailDto> {
  const [keywords, takeaways, content] = await Promise.all([
    env.DB.prepare(
      "SELECT id, keyword FROM blog_post_keywords WHERE post_id = ? ORDER BY sort_order ASC, id ASC",
    )
      .bind(post.id)
      .all<BlogKeywordRow>(),
    env.DB.prepare(
      "SELECT id, takeaway FROM blog_post_key_takeaways WHERE post_id = ? ORDER BY sort_order ASC, id ASC",
    )
      .bind(post.id)
      .all<BlogTakeawayRow>(),
    env.DB.prepare(
      "SELECT id, paragraph FROM blog_post_content WHERE post_id = ? ORDER BY sort_order ASC, id ASC",
    )
      .bind(post.id)
      .all<BlogContentRow>(),
  ]);

  return {
    id: post.id,
    title: post.title,
    category: post.category,
    readTime: post.read_time,
    date: post.date,
    publishDateIso: post.publish_date_iso,
    author: post.author,
    image: post.image,
    excerpt: post.excerpt,
    featured: post.featured === 1,
    keywords: keywords.results.map((r) => r.keyword),
    keyTakeaways: takeaways.results.map((r) => r.takeaway),
    content: content.results.map((r) => r.paragraph),
  };
}

export async function listBlogs(_request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured FROM blog_posts ORDER BY publish_date_iso DESC, id ASC",
  ).all<BlogRow>();

  const blogs = await Promise.all(results.map((row) => fetchFullBlog(env, row)));
  return jsonResponse(blogs);
}

export async function getBlog(_request: Request, env: Env, id: string): Promise<Response> {
  const post = await env.DB.prepare(
    "SELECT id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured FROM blog_posts WHERE id = ?",
  )
    .bind(id)
    .first<BlogRow>();

  if (!post) {
    return errorResponse("Blog post not found", 404, "NOT_FOUND");
  }

  return jsonResponse(await fetchFullBlog(env, post));
}

export async function createBlog(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return errorResponse("Blog title is required", 400, "VALIDATION_ERROR");
  }

  let id = typeof body.id === "string" && body.id.trim() ? slugify(body.id) : slugify(title);
  if (!id) {
    id = `blog-${Date.now()}`;
  }

  const existing = await env.DB.prepare("SELECT id FROM blog_posts WHERE id = ?").bind(id).first();
  if (existing) {
    id = `${id}-${Date.now().toString(36)}`;
  }

  const category = typeof body.category === "string" ? body.category.trim() : "Technology";
  const readTime =
    typeof body.readTime === "string"
      ? body.readTime.trim()
      : typeof body.read_time === "string"
        ? body.read_time.trim()
        : "5 min read";
  const now = new Date();
  const date =
    typeof body.date === "string" && body.date.trim()
      ? body.date.trim()
      : now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const publishDateIso =
    typeof body.publishDateIso === "string" && body.publishDateIso.trim()
      ? body.publishDateIso.trim()
      : typeof body.publish_date_iso === "string" && body.publish_date_iso.trim()
        ? body.publish_date_iso.trim()
        : now.toISOString();
  const author = typeof body.author === "string" ? body.author.trim() : "Tech Agenz Team";
  const image = typeof body.image === "string" ? body.image.trim() : "/blog-images/default.webp";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const featured = body.featured === true || body.featured === 1 || body.featured === "1" ? 1 : 0;

  const keywords: string[] = Array.isArray(body.keywords)
    ? body.keywords.map((k: unknown) => String(k).trim()).filter(Boolean)
    : [];
  const keyTakeaways: string[] = Array.isArray(body.keyTakeaways)
    ? body.keyTakeaways.map((t: unknown) => String(t).trim()).filter(Boolean)
    : Array.isArray(body.key_takeaways)
      ? body.key_takeaways.map((t: unknown) => String(t).trim()).filter(Boolean)
      : [];
  const content: string[] = Array.isArray(body.content)
    ? body.content.map((c: unknown) => String(c).trim()).filter(Boolean)
    : [];

  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO blog_posts (id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    ).bind(id, title, category, readTime, date, publishDateIso, author, image, excerpt, featured),
  ];

  keywords.forEach((keyword, index) => {
    statements.push(
      env.DB.prepare(
        "INSERT INTO blog_post_keywords (post_id, keyword, sort_order) VALUES (?, ?, ?)",
      ).bind(id, keyword, index),
    );
  });

  keyTakeaways.forEach((takeaway, index) => {
    statements.push(
      env.DB.prepare(
        "INSERT INTO blog_post_key_takeaways (post_id, takeaway, sort_order) VALUES (?, ?, ?)",
      ).bind(id, takeaway, index),
    );
  });

  content.forEach((paragraph, index) => {
    statements.push(
      env.DB.prepare(
        "INSERT INTO blog_post_content (post_id, paragraph, sort_order) VALUES (?, ?, ?)",
      ).bind(id, paragraph, index),
    );
  });

  await env.DB.batch(statements);

  const created = await env.DB.prepare(
    "SELECT id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured FROM blog_posts WHERE id = ?",
  )
    .bind(id)
    .first<BlogRow>();

  return jsonResponse(await fetchFullBlog(env, created!), 201);
}

export async function updateBlog(request: Request, env: Env, id: string): Promise<Response> {
  const existing = await env.DB.prepare(
    "SELECT id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured FROM blog_posts WHERE id = ?",
  )
    .bind(id)
    .first<BlogRow>();

  if (!existing) {
    return errorResponse("Blog post not found", 404, "NOT_FOUND");
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const title = typeof body.title === "string" ? body.title.trim() : existing.title;
  if (!title) {
    return errorResponse("Blog title cannot be empty", 400, "VALIDATION_ERROR");
  }

  const category = typeof body.category === "string" ? body.category.trim() : existing.category;
  const readTime =
    typeof body.readTime === "string"
      ? body.readTime.trim()
      : typeof body.read_time === "string"
        ? body.read_time.trim()
        : existing.read_time;
  const date = typeof body.date === "string" && body.date.trim() ? body.date.trim() : existing.date;
  const publishDateIso =
    typeof body.publishDateIso === "string" && body.publishDateIso.trim()
      ? body.publishDateIso.trim()
      : typeof body.publish_date_iso === "string" && body.publish_date_iso.trim()
        ? body.publish_date_iso.trim()
        : existing.publish_date_iso;
  const author = typeof body.author === "string" ? body.author.trim() : existing.author;
  const image = typeof body.image === "string" ? body.image.trim() : existing.image;
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : existing.excerpt;
  const featured =
    body.featured !== undefined
      ? body.featured === true || body.featured === 1 || body.featured === "1"
        ? 1
        : 0
      : existing.featured;

  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `UPDATE blog_posts
       SET title = ?, category = ?, read_time = ?, date = ?, publish_date_iso = ?, author = ?, image = ?, excerpt = ?, featured = ?, updated_at = datetime('now')
       WHERE id = ?`,
    ).bind(title, category, readTime, date, publishDateIso, author, image, excerpt, featured, id),
  ];

  if (Array.isArray(body.keywords)) {
    statements.push(env.DB.prepare("DELETE FROM blog_post_keywords WHERE post_id = ?").bind(id));
    body.keywords.forEach((keyword: unknown, index: number) => {
      const clean = String(keyword).trim();
      if (clean) {
        statements.push(
          env.DB.prepare(
            "INSERT INTO blog_post_keywords (post_id, keyword, sort_order) VALUES (?, ?, ?)",
          ).bind(id, clean, index),
        );
      }
    });
  }

  const takeawaysArr = Array.isArray(body.keyTakeaways)
    ? body.keyTakeaways
    : Array.isArray(body.key_takeaways)
      ? body.key_takeaways
      : null;
  if (takeawaysArr) {
    statements.push(
      env.DB.prepare("DELETE FROM blog_post_key_takeaways WHERE post_id = ?").bind(id),
    );
    takeawaysArr.forEach((takeaway: unknown, index: number) => {
      const clean = String(takeaway).trim();
      if (clean) {
        statements.push(
          env.DB.prepare(
            "INSERT INTO blog_post_key_takeaways (post_id, takeaway, sort_order) VALUES (?, ?, ?)",
          ).bind(id, clean, index),
        );
      }
    });
  }

  if (Array.isArray(body.content)) {
    statements.push(env.DB.prepare("DELETE FROM blog_post_content WHERE post_id = ?").bind(id));
    body.content.forEach((paragraph: unknown, index: number) => {
      const clean = String(paragraph).trim();
      if (clean) {
        statements.push(
          env.DB.prepare(
            "INSERT INTO blog_post_content (post_id, paragraph, sort_order) VALUES (?, ?, ?)",
          ).bind(id, clean, index),
        );
      }
    });
  }

  await env.DB.batch(statements);

  const updated = await env.DB.prepare(
    "SELECT id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured FROM blog_posts WHERE id = ?",
  )
    .bind(id)
    .first<BlogRow>();

  return jsonResponse(await fetchFullBlog(env, updated!), 200);
}

export async function deleteBlog(_request: Request, env: Env, id: string): Promise<Response> {
  const existing = await env.DB.prepare("SELECT id FROM blog_posts WHERE id = ?").bind(id).first();
  if (!existing) {
    return errorResponse("Blog post not found", 404, "NOT_FOUND");
  }

  await env.DB.batch([
    env.DB.prepare("DELETE FROM blog_post_keywords WHERE post_id = ?").bind(id),
    env.DB.prepare("DELETE FROM blog_post_key_takeaways WHERE post_id = ?").bind(id),
    env.DB.prepare("DELETE FROM blog_post_content WHERE post_id = ?").bind(id),
    env.DB.prepare("DELETE FROM blog_posts WHERE id = ?").bind(id),
  ]);

  return jsonResponse({ deleted: true, id }, 200);
}
