import type { VercelRequest, VercelResponse } from "@vercel/node";
import cmsData from "../src/data/cms-data.json";

/**
 * Fetch JSON from a GitHub raw URL, returning null on any failure.
 */
async function fetchRawJson(url: string, token?: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache, no-store",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Compare two ISO timestamp strings and return the one that is newer.
 * Falls back to `b` if neither is a valid date.
 */
function newerData(
  a: { lastSyncedAt?: string; team?: unknown[]; blogs?: unknown[] } | null,
  b: { lastSyncedAt?: string; team?: unknown[]; blogs?: unknown[] } | null,
): { lastSyncedAt?: string; team?: unknown[]; blogs?: unknown[] } | null {
  if (!a) return b;
  if (!b) return a;
  const tsA = a.lastSyncedAt ? Date.parse(a.lastSyncedAt) : 0;
  const tsB = b.lastSyncedAt ? Date.parse(b.lastSyncedAt) : 0;
  return tsA >= tsB ? a : b;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Hard-disable all caches so every request reads live GitHub state
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");

  const owner = process.env.GITHUB_REPO_OWNER || "AliHaider3435";
  const repo = process.env.GITHUB_REPO_NAME || "techagenz";
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  const cacheBust = `t=${Date.now()}`;
  const filePath = "src/data/cms-data.json";

  type CmsPayload = { lastSyncedAt?: string; team?: unknown[]; blogs?: unknown[] };

  // 1. Try the dedicated cms-data branch (written by the Admin Panel)
  let cmsDataBranchJson: CmsPayload | null = null;
  try {
    const raw = (await fetchRawJson(
      `https://raw.githubusercontent.com/${owner}/${repo}/cms-data/${filePath}?${cacheBust}`,
      token,
    )) as CmsPayload | null;
    if (raw && (Array.isArray(raw.team) || Array.isArray(raw.blogs))) {
      cmsDataBranchJson = raw;
    }
  } catch (err) {
    console.warn("[api/cms] cms-data branch fetch error:", err);
  }

  // 2. Try the main branch (reflects VS Code / Vercel-deployed code)
  let mainBranchJson: CmsPayload | null = null;
  try {
    const raw = (await fetchRawJson(
      `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}?${cacheBust}`,
      token,
    )) as CmsPayload | null;
    if (raw && (Array.isArray(raw.team) || Array.isArray(raw.blogs))) {
      mainBranchJson = raw;
    }
  } catch (err) {
    console.warn("[api/cms] main branch fetch error:", err);
  }

  // 3. Pick whichever branch has the newer lastSyncedAt timestamp.
  //    Admin Panel writes to cms-data → its timestamp will always be >= main.
  //    If the developer intentionally updated team/blogs in VS Code and pushed
  //    to main with a newer timestamp, that intentional change is still honoured.
  const best = newerData(cmsDataBranchJson, mainBranchJson);

  if (best && (Array.isArray(best.team) || Array.isArray(best.blogs))) {
    return res.status(200).json({
      success: true,
      source: "github-live",
      data: best,
    });
  }

  // 4. Last-resort: bundled static JSON baked into the Vercel deployment
  return res.status(200).json({
    success: true,
    source: "local-bundled",
    data: cmsData,
  });
}
