/**
 * Minimal GitHub "commit multiple files" helper.
 *
 * Uses the Git Data API to produce a single commit with N file updates,
 * so one admin save = one Vercel deploy (atomic). This avoids the
 * per-file chatter of the Contents API and its N commits.
 *
 * Flow:
 *   1. GET  ref  — current head SHA of the branch.
 *   2. GET  commit — its tree SHA.
 *   3. POST blob(s) — upload each file's content.
 *   4. POST tree — new tree with the uploaded blobs.
 *   5. POST commit — new commit pointing to the tree, parent = old head.
 *   6. PATCH ref — fast-forward the branch to the new commit.
 */

export type CommitFile = {
  /** Path from repo root, forward-slashed. e.g. "site/content/works.json" */
  path: string;
  /** UTF-8 content of the file at that path. */
  content: string;
};

export type CommitParams = {
  token: string;
  repo: string;     // "owner/name"
  branch: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  files: CommitFile[];
};

const BASE = "https://api.github.com";

async function gh<T>(
  token: string,
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("User-Agent", "nxyz-admin/1.0");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GitHub ${init.method ?? "GET"} ${url} -> ${res.status}: ${text.slice(0, 280)}`,
    );
  }
  return (await res.json()) as T;
}

export async function commitFiles(params: CommitParams): Promise<{
  commitSha: string;
  commitUrl: string;
}> {
  const { token, repo, branch, files, message } = params;
  if (!token) throw new Error("GitHub token missing.");
  if (!repo.includes("/")) throw new Error("Repo must be 'owner/name'.");
  if (!files.length) throw new Error("No files to commit.");

  // 1. Current ref head.
  const ref = await gh<{ object: { sha: string } }>(
    token,
    `${BASE}/repos/${repo}/git/refs/heads/${branch}`,
  );
  const headSha = ref.object.sha;

  // 2. Current commit -> tree sha.
  const headCommit = await gh<{ tree: { sha: string } }>(
    token,
    `${BASE}/repos/${repo}/git/commits/${headSha}`,
  );
  const baseTreeSha = headCommit.tree.sha;

  // 3. Upload each file as a blob.
  const blobs = await Promise.all(
    files.map((f) =>
      gh<{ sha: string }>(token, `${BASE}/repos/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: Buffer.from(f.content, "utf8").toString("base64"),
          encoding: "base64",
        }),
      }).then((r) => ({ path: f.path, sha: r.sha })),
    ),
  );

  // 4. New tree building on the current one.
  const tree = await gh<{ sha: string }>(
    token,
    `${BASE}/repos/${repo}/git/trees`,
    {
      method: "POST",
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: blobs.map((b) => ({
          path: b.path,
          mode: "100644",
          type: "blob",
          sha: b.sha,
        })),
      }),
    },
  );

  // 5. New commit.
  const commit = await gh<{ sha: string; html_url: string }>(
    token,
    `${BASE}/repos/${repo}/git/commits`,
    {
      method: "POST",
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [headSha],
        author: params.authorName && params.authorEmail
          ? {
              name: params.authorName,
              email: params.authorEmail,
              date: new Date().toISOString(),
            }
          : undefined,
      }),
    },
  );

  // 6. Fast-forward branch to the new commit.
  await gh<unknown>(
    token,
    `${BASE}/repos/${repo}/git/refs/heads/${branch}`,
    {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    },
  );

  return { commitSha: commit.sha, commitUrl: commit.html_url };
}
