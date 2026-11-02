import { defineEventHandler } from "h3";
import cmsData from "../../src/data/cms-data.json";

type CmsPayload = { lastSyncedAt?: string; team?: unknown[]; blogs?: unknown[] };

/**
 * Fetch JSON from a URL, returning null on any failure.
 */
async function fetchRawJson(url: string, token?: string): Promise<CmsPayload | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache, no-store",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return null;
    const json = await res.json() as CmsPayload;
    return json;
  } catch {
    return null;
  }
}

/**
 * Return whichever payload has the newer lastSyncedAt timestamp.
 */
function newerData(a: CmsPayload | null, b: CmsPayload | null): CmsPayload | null {
  if (!a) return b;
  if (!b) return a;
  const tsA = a.lastSyncedAt ? Date.parse(a.lastSyncedAt) : 0;
  const tsB = b.lastSyncedAt ? Date.parse(b.lastSyncedAt) : 0;
  return tsA >= tsB ? a : b;
}

export default defineEventHandler(async (event) => {
  event.node.res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  event.node.res.setHeader("Pragma", "no-cache");
  event.node.res.setHeader("Expires", "0");

  const owner = process.env.GITHUB_REPO_OWNER || "AliHaider3435";
  const repo = process.env.GITHUB_REPO_NAME || "techagenz";
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  const cacheBust = `t=${Date.now()}`;
  const filePath = "src/data/cms-data.json";

  // 1. Fetch from cms-data branch (Admin Panel writes here)
  const cmsDataBranchJson = await fetchRawJson(
    `https://raw.githubusercontent.com/${owner}/${repo}/cms-data/${filePath}?${cacheBust}`,
    token,
  );

  // 2. Fetch from main branch (VS Code / Vercel deployment source)
  const mainBranchJson = await fetchRawJson(
    `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}?${cacheBust}`,
    token,
  );

  // 3. Return whichever is newer so Admin Panel changes always survive VS Code pushes
  const best = newerData(
    cmsDataBranchJson && (Array.isArray(cmsDataBranchJson.team) || Array.isArray(cmsDataBranchJson.blogs))
      ? cmsDataBranchJson
      : null,
    mainBranchJson && (Array.isArray(mainBranchJson.team) || Array.isArray(mainBranchJson.blogs))
      ? mainBranchJson
      : null,
  );

  if (best) {
    return {
      success: true,
      source: "github-live",
      data: best,
    };
  }

  // 4. Last-resort: bundled static JSON
  return {
    success: true,
    source: "local-bundled",
    data: cmsData,
  };
});
