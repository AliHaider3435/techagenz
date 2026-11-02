import { defineEventHandler } from "h3";
import cmsData from "../../src/data/cms-data.json";

export default defineEventHandler(async (event) => {
  event.node.res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  event.node.res.setHeader("Pragma", "no-cache");
  event.node.res.setHeader("Expires", "0");

  const owner = process.env.GITHUB_REPO_OWNER || "AliHaider3435";
  const repo = process.env.GITHUB_REPO_NAME || "techagenz";
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();

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
        return {
          success: true,
          source: "github-live",
          data: liveJson,
        };
      }
    }
  } catch (err) {
    console.warn("[cms.get] GitHub live fetch error:", err);
  }

  return {
    success: true,
    source: "local-bundled",
    data: cmsData,
  };
});
