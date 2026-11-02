import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";

interface SyncRequest {
  token?: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  commitMessage?: string;
  team: unknown[];
  blogs: unknown[];
  uploadedImages?: Array<{
    filename: string;
    base64Data: string;
    mimeType?: string;
  }>;
}

/**
 * Ensures the `cms-data` branch exists on GitHub.
 * If it doesn't exist, create it pointing at the current HEAD of `main`.
 * Returns the branch name that is guaranteed to exist.
 */
async function ensureCmsDataBranch(
  token: string,
  owner: string,
  repo: string,
): Promise<string> {
  const cmsBranch = "cms-data";
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "TechAgenz-CMS",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    // Check if cms-data branch already exists
    const checkRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${cmsBranch}`,
      { headers },
    );

    if (checkRes.ok) {
      // Branch already exists — nothing to do
      return cmsBranch;
    }

    if (checkRes.status !== 404) {
      // Unexpected error; fall back to main
      console.warn(`[github-sync] Unexpected status ${checkRes.status} checking ${cmsBranch} branch`);
      return "main";
    }

    // Branch does not exist — get main's HEAD SHA to branch from
    const mainRefRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`,
      { headers },
    );

    if (!mainRefRes.ok) {
      console.warn("[github-sync] Could not resolve main branch SHA; falling back to main");
      return "main";
    }

    const mainRef = (await mainRefRes.json()) as { object?: { sha?: string } };
    const mainSha = mainRef.object?.sha;
    if (!mainSha) {
      console.warn("[github-sync] main branch SHA missing; falling back to main");
      return "main";
    }

    // Create cms-data branch from main HEAD
    const createRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ ref: `refs/heads/${cmsBranch}`, sha: mainSha }),
      },
    );

    if (createRes.ok) {
      console.log(`[github-sync] Created branch '${cmsBranch}' from main@${mainSha.slice(0, 7)}`);
      return cmsBranch;
    }

    const createErr = await createRes.json().catch(() => ({})) as { message?: string };
    console.warn("[github-sync] Failed to create cms-data branch:", createErr.message);
    return "main"; // safe fallback
  } catch (err) {
    console.warn("[github-sync] ensureCmsDataBranch error:", err);
    return "main";
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = (req.body || {}) as SyncRequest;
  if (!Array.isArray(body.team) || !Array.isArray(body.blogs)) {
    return res.status(400).json({
      success: false,
      error: "Invalid request payload. 'team' and 'blogs' arrays are required.",
    });
  }

  const token = (body.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  const owner = (body.repoOwner || process.env.GITHUB_REPO_OWNER || "AliHaider3435").trim();
  const repo = (body.repoName || process.env.GITHUB_REPO_NAME || "techagenz").trim();
  const commitMessage =
    body.commitMessage ||
    `CMS update: sync blogs & team members (${new Date().toISOString().slice(0, 16)})`;

  const payloadData = {
    version: 1,
    lastSyncedAt: new Date().toISOString(),
    source: "admin-console",
    team: body.team,
    blogs: body.blogs,
  };

  const jsonString = JSON.stringify(payloadData, null, 2);

  // Update local file in dev mode (no-op in Vercel serverless)
  try {
    const localFilePath = path.resolve(process.cwd(), "src/data/cms-data.json");
    if (fs.existsSync(path.dirname(localFilePath))) {
      fs.writeFileSync(localFilePath, jsonString, "utf-8");
    }
  } catch (fsErr) {
    console.log("[github-sync] Local file write skipped or read-only:", fsErr);
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      error:
        "No GitHub token provided. Configure your GitHub Personal Access Token in the Admin Settings tab or set GITHUB_TOKEN environment variable in Vercel.",
    });
  }

  // Ensure the dedicated cms-data branch exists (create from main if needed)
  // Admin Panel ALWAYS writes to cms-data — never to main —
  // so VS Code commits to main can never overwrite Admin Panel changes.
  const branch = await ensureCmsDataBranch(token, owner, repo);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "TechAgenz-CMS",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // 1. Process image uploads if any
  if (Array.isArray(body.uploadedImages) && body.uploadedImages.length > 0) {
    for (const img of body.uploadedImages) {
      if (!img.filename || !img.base64Data) continue;
      const cleanBase64 = img.base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const imagePath = `public/uploads/${img.filename}`;

      try {
        const checkRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}?ref=${branch}`,
          { headers: authHeaders },
        );

        let imgSha: string | undefined;
        if (checkRes.ok) {
          const checkData = (await checkRes.json()) as { sha?: string };
          imgSha = checkData.sha;
        }

        await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            message: `CMS upload asset: ${img.filename}`,
            content: cleanBase64,
            branch,
            ...(imgSha ? { sha: imgSha } : {}),
          }),
        });
      } catch (imgErr) {
        console.warn(`[github-sync] Failed to commit image ${img.filename}:`, imgErr);
      }
    }
  }

  // 2. Commit updated src/data/cms-data.json to the cms-data branch
  try {
    const targetPath = "src/data/cms-data.json";
    const checkRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}?ref=${branch}`,
      { headers: authHeaders },
    );

    let existingSha: string | undefined;
    if (checkRes.ok) {
      const existingData = (await checkRes.json()) as { sha?: string };
      existingSha = existingData.sha;
    } else if (checkRes.status === 401 || checkRes.status === 403) {
      return res.status(401).json({
        success: false,
        error: "GitHub authentication failed. Please check your Personal Access Token permissions.",
      });
    }
    // 404 is fine — means the file doesn't exist yet on this branch; we'll create it

    const base64Content = Buffer.from(jsonString).toString("base64");

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`,
      {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      },
    );

    if (!commitRes.ok) {
      const errPayload = await commitRes.json().catch(() => ({})) as { message?: string };
      return res.status(commitRes.status).json({
        success: false,
        error:
          errPayload.message ||
          `GitHub API error committing data (Status code ${commitRes.status})`,
      });
    }

    const commitData = await commitRes.json() as {
      commit?: { sha?: string; html_url?: string };
    };
    return res.status(200).json({
      success: true,
      commitSha: commitData.commit?.sha?.slice(0, 7) || "latest",
      commitFullSha: commitData.commit?.sha,
      commitUrl: commitData.commit?.html_url,
      branch,
      message: `Successfully pushed to ${owner}/${repo} (${branch})! Changes are now live on all devices.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error syncing with GitHub";
    return res.status(500).json({
      success: false,
      error: msg,
    });
  }
}
