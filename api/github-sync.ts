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
  const branch = (body.branch || process.env.GITHUB_BRANCH || "main").trim();
  const commitMessage =
    body.commitMessage ||
    `CMS update: sync blogs & team members (${new Date().toISOString().slice(0, 16)})`;

  const payloadData = {
    version: 1,
    lastSyncedAt: new Date().toISOString(),
    team: body.team,
    blogs: body.blogs,
  };

  const jsonString = JSON.stringify(payloadData, null, 2);

  // If local filesystem is writable (e.g. dev mode), update local file too
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

  // 1. Process image uploads if any
  if (Array.isArray(body.uploadedImages) && body.uploadedImages.length > 0) {
    for (const img of body.uploadedImages) {
      if (!img.filename || !img.base64Data) continue;
      const cleanBase64 = img.base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const imagePath = `public/uploads/${img.filename}`;

      try {
        const checkRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}?ref=${branch}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "User-Agent": "TechAgenz-CMS",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          },
        );

        let imgSha: string | undefined;
        if (checkRes.ok) {
          const checkData = (await checkRes.json()) as { sha?: string };
          imgSha = checkData.sha;
        }

        await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "TechAgenz-CMS",
            "X-GitHub-Api-Version": "2022-11-28",
          },
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

  // 2. Commit updated src/data/cms-data.json to GitHub
  try {
    const targetPath = "src/data/cms-data.json";
    const checkRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "TechAgenz-CMS",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
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

    const base64Content = Buffer.from(jsonString).toString("base64");

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "TechAgenz-CMS",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      },
    );

    if (!commitRes.ok) {
      const errPayload = await commitRes.json().catch(() => ({}));
      return res.status(commitRes.status).json({
        success: false,
        error:
          errPayload.message ||
          `GitHub API error committing data (Status code ${commitRes.status})`,
      });
    }

    const commitData = await commitRes.json();
    return res.status(200).json({
      success: true,
      commitSha: commitData.commit?.sha?.slice(0, 7) || "latest",
      commitFullSha: commitData.commit?.sha,
      commitUrl: commitData.commit?.html_url,
      branch,
      message: `Successfully pushed to ${owner}/${repo} (${branch})! Vercel is now deploying your changes automatically.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error syncing with GitHub";
    return res.status(500).json({
      success: false,
      error: msg,
    });
  }
}
