import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const token = (body.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  const owner = (body.repoOwner || process.env.GITHUB_REPO_OWNER || "AliHaider3435").trim();
  const repo = (body.repoName || process.env.GITHUB_REPO_NAME || "techagenz").trim();

  if (!token) {
    return res.status(400).json({
      success: false,
      error: "No GitHub token provided. Please enter a Personal Access Token with repo access.",
    });
  }

  try {
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "TechAgenz-CMS",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!ghRes.ok) {
      if (ghRes.status === 401) {
        return res.status(401).json({
          success: false,
          error: "Invalid GitHub token. Please verify your token and ensure it has not expired.",
        });
      }
      if (ghRes.status === 404) {
        return res.status(404).json({
          success: false,
          error: `Repository ${owner}/${repo} not found, or your token lacks access to private repositories. Ensure 'repo' scope is selected.`,
        });
      }
      const errData = await ghRes.json().catch(() => ({}));
      return res.status(ghRes.status).json({
        success: false,
        error: errData.message || `GitHub API error (Status ${ghRes.status})`,
      });
    }

    const repoData = await ghRes.json();
    const permissions = repoData.permissions || {};

    if (permissions.push === false) {
      return res.status(200).json({
        success: false,
        warning: `Connected to ${repoData.full_name}, but your token only has READ permission. Please create a token with WRITE / PUSH ('repo') access.`,
        repo: repoData.full_name,
        defaultBranch: repoData.default_branch,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully connected to GitHub repository ${repoData.full_name} (${repoData.private ? "Private" : "Public"})!`,
      repo: repoData.full_name,
      defaultBranch: repoData.default_branch || "main",
      canPush: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error contacting GitHub";
    return res.status(500).json({
      success: false,
      error: msg,
    });
  }
}
