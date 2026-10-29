import { defineEventHandler, readBody } from "h3";

interface TestRequest {
  token?: string;
  repoOwner?: string;
  repoName?: string;
}

export default defineEventHandler(async (event) => {
  const body = (await readBody<TestRequest>(event)) || {};
  const token = (body.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  const owner = (body.repoOwner || process.env.GITHUB_REPO_OWNER || "AliHaider3435").trim();
  const repo = (body.repoName || process.env.GITHUB_REPO_NAME || "techagenz").trim();

  if (!token) {
    return {
      success: false,
      error: "No GitHub token provided. Please enter a Personal Access Token with repo access.",
    };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "TechAgenz-CMS",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return {
          success: false,
          error: "Invalid GitHub token. Please verify your token and permissions.",
        };
      }
      if (res.status === 404) {
        return {
          success: false,
          error: `Repository ${owner}/${repo} not found, or your token does not have access to private repositories.`,
        };
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.message || `GitHub API error (Status ${res.status})`,
      };
    }

    const repoData = await res.json();
    const permissions = repoData.permissions || {};

    if (permissions.push === false) {
      return {
        success: false,
        warning: `Connected to ${repoData.full_name}, but your token only has READ permission. Please grant WRITE / PUSH access.`,
        repo: repoData.full_name,
        defaultBranch: repoData.default_branch,
      };
    }

    return {
      success: true,
      message: `Successfully connected to GitHub repository ${repoData.full_name} (${repoData.private ? "Private" : "Public"})!`,
      repo: repoData.full_name,
      defaultBranch: repoData.default_branch || "main",
      canPush: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error contacting GitHub";
    return {
      success: false,
      error: msg,
    };
  }
});
