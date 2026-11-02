import type { VercelRequest, VercelResponse } from "@vercel/node";
import cmsData from "../src/data/cms-data.json";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");

  const owner = process.env.GITHUB_REPO_OWNER || "AliHaider3435";
  const repo = process.env.GITHUB_REPO_NAME || "techagenz";
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();

  // 1. Attempt to fetch live content directly from GitHub repository main branch
  try {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/src/data/cms-data.json?t=${Date.now()}`;
    const rawRes = await fetch(rawUrl, {
      headers: {
        "Cache-Control": "no-cache",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (rawRes.ok) {
      const liveJson = (await rawRes.json()) as { team?: unknown[]; blogs?: unknown[] };
      if (liveJson && (Array.isArray(liveJson.team) || Array.isArray(liveJson.blogs))) {
        return res.status(200).json({
          success: true,
          source: "github-live",
          data: liveJson,
        });
      }
    }
  } catch (err) {
    console.warn("[api/cms] GitHub raw fetch error:", err);
  }

  // 2. Attempt GitHub Contents API
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/src/data/cms-data.json?ref=${branch}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (apiRes.ok) {
      const fileData = (await apiRes.json()) as { content?: string };
      if (fileData.content) {
        const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded);
        return res.status(200).json({
          success: true,
          source: "github-api",
          data: parsed,
        });
      }
    }
  } catch (err) {
    console.warn("[api/cms] GitHub API fetch error:", err);
  }

  // 3. Fallback to bundled local data
  return res.status(200).json({
    success: true,
    source: "local-bundled",
    data: cmsData,
  });
}
