import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { commitFiles } from "@/lib/github-commit";

/**
 * Admin save.
 *
 * - Dev: writes straight to content/*.json, picked up by HMR and the
 *   running build.
 * - Prod: commits to GitHub via the Git Data API (one atomic commit for
 *   works, products, and people) so Vercel rebuilds and serves the new
 *   content within ~30s. The filesystem on Vercel is read-only at runtime.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  works?: unknown;
  products?: unknown;
  people?: unknown;
  /** Appended to GitHub commit body in production only (max ~500 chars). */
  commitNote?: unknown;
};

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function validateWork(w: unknown, i: number): string | null {
  if (!w || typeof w !== "object") return `works[${i}] is not an object`;
  const r = w as Record<string, unknown>;
  if (!isString(r.slug) || !r.slug) return `works[${i}].slug required`;
  if (!isString(r.n)) return `works[${i}].n required`;
  if (typeof r.year !== "number") return `works[${i}].year must be a number`;
  if (!isString(r.title)) return `works[${i}].title required`;
  if (!isString(r.kind)) return `works[${i}].kind required`;
  if (!isString(r.tone) || !["light", "soft", "dark", "ui"].includes(r.tone))
    return `works[${i}].tone must be one of light|soft|dark|ui`;
  if (!Array.isArray(r.role)) return `works[${i}].role must be an array`;
  if (!isString(r.summary)) return `works[${i}].summary required`;
  if (r.personSlugs !== undefined) {
    if (!Array.isArray(r.personSlugs))
      return `works[${i}].personSlugs must be an array of strings if set`;
    if (!r.personSlugs.every((x) => isString(x)))
      return `works[${i}].personSlugs entries must be strings`;
  }
  return null;
}

function validateProduct(p: unknown, i: number): string | null {
  if (!p || typeof p !== "object") return `products[${i}] is not an object`;
  const r = p as Record<string, unknown>;
  if (!isString(r.slug) || !r.slug) return `products[${i}].slug required`;
  if (!isString(r.n)) return `products[${i}].n required`;
  if (!isString(r.name)) return `products[${i}].name required`;
  if (!isString(r.domain)) return `products[${i}].domain required`;
  if (!isString(r.url)) return `products[${i}].url required`;
  if (typeof r.year !== "number")
    return `products[${i}].year must be a number`;
  if (!isString(r.tagline)) return `products[${i}].tagline required`;
  if (!isString(r.summary)) return `products[${i}].summary required`;
  if (!Array.isArray(r.disciplines))
    return `products[${i}].disciplines must be an array`;
  if (
    !isString(r.status) ||
    !["live", "public-beta", "private-beta", "coming-soon"].includes(r.status)
  )
    return `products[${i}].status invalid`;
  if (!isString(r.accent)) return `products[${i}].accent required`;
  return null;
}

function validatePerson(p: unknown, i: number): string | null {
  if (!p || typeof p !== "object") return `people[${i}] is not an object`;
  const r = p as Record<string, unknown>;
  if (!isString(r.slug) || !r.slug) return `people[${i}].slug required`;
  if (!isString(r.n)) return `people[${i}].n required`;
  if (!isString(r.name)) return `people[${i}].name required`;
  if (!isString(r.role)) return `people[${i}].role required`;
  if (!isString(r.tagline)) return `people[${i}].tagline required`;
  if (!Array.isArray(r.bio) || !r.bio.every((x) => isString(x)))
    return `people[${i}].bio must be an array of strings`;
  if (r.photoSrc !== null && (typeof r.photoSrc !== "string" || !r.photoSrc))
    return `people[${i}].photoSrc must be a non-empty string or null`;
  if (!Array.isArray(r.links)) return `people[${i}].links must be an array`;
  for (let j = 0; j < r.links.length; j++) {
    const l = (r.links as unknown[])[j];
    if (!l || typeof l !== "object")
      return `people[${i}].links[${j}] is not an object`;
    const o = l as Record<string, unknown>;
    if (!isString(o.label) || !isString(o.href))
      return `people[${i}].links[${j}].label and .href are required strings`;
  }
  if (!Array.isArray(r.workSlugs) || !r.workSlugs.every((x) => isString(x)))
    return `people[${i}].workSlugs must be an array of strings`;
  if (r.otherWork !== undefined) {
    if (!Array.isArray(r.otherWork)) return `people[${i}].otherWork must be an array`;
    for (let j = 0; j < r.otherWork.length; j++) {
      const ow = (r.otherWork as unknown[])[j];
      if (!ow || typeof ow !== "object")
        return `people[${i}].otherWork[${j}] is not an object`;
      const o = ow as Record<string, unknown>;
      if (!isString(o.title) || !isString(o.href))
        return `people[${i}].otherWork[${j}].title and .href are required strings`;
      if (o.year !== undefined && !isString(o.year))
        return `people[${i}].otherWork[${j}].year must be a string if set`;
      if (o.note !== undefined && !isString(o.note))
        return `people[${i}].otherWork[${j}].note must be a string if set`;
    }
  }
  return null;
}

export async function POST(request: Request) {
  // 1. Auth gate.
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  let session = null;
  try {
    session = verifySession(token);
  } catch {
    session = null;
  }
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  // 2. Parse + validate body.
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  if (
    !Array.isArray(body.works) ||
    !Array.isArray(body.products) ||
    !Array.isArray(body.people)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Body must include `works`, `products`, and `people` arrays.",
      },
      { status: 400 },
    );
  }
  for (let i = 0; i < body.works.length; i++) {
    const err = validateWork(body.works[i], i);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
  }
  for (let i = 0; i < body.products.length; i++) {
    const err = validateProduct(body.products[i], i);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
  }
  for (let i = 0; i < body.people.length; i++) {
    const err = validatePerson(body.people[i], i);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
  }

  let commitNote = "";
  if (body.commitNote !== undefined && body.commitNote !== null) {
    if (typeof body.commitNote !== "string") {
      return NextResponse.json(
        { ok: false, error: "`commitNote` must be a string if provided." },
        { status: 400 },
      );
    }
    commitNote = body.commitNote.trim().slice(0, 500);
  }

  const worksJson = JSON.stringify(body.works, null, 2) + "\n";
  const productsJson = JSON.stringify(body.products, null, 2) + "\n";
  const peopleJson = JSON.stringify(body.people, null, 2) + "\n";

  // 3. Dev path — write to the local repo so HMR picks it up.
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    try {
      const worksPath = path.join(process.cwd(), "content", "works.json");
      const productsPath = path.join(process.cwd(), "content", "products.json");
      const peoplePath = path.join(process.cwd(), "content", "people.json");
      await Promise.all([
        fs.writeFile(worksPath, worksJson, "utf8"),
        fs.writeFile(productsPath, productsJson, "utf8"),
        fs.writeFile(peoplePath, peopleJson, "utf8"),
      ]);
      return NextResponse.json({
        ok: true,
        mode: "local",
        message: "Saved to content/*.json. Review with `git diff`.",
      });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: `Write failed: ${(err as Error).message}` },
        { status: 500 },
      );
    }
  }

  // 4. Prod path — commit to GitHub. One commit, one deploy.
  const ghToken = process.env.GITHUB_TOKEN;
  const ghRepo = process.env.GITHUB_REPO ?? "syfpsy/nxyz-art";
  const ghBranch = process.env.GITHUB_BRANCH ?? "main";

  if (!ghToken) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Production saves need a GitHub PAT. Set GITHUB_TOKEN in Vercel (fine-grained PAT with Contents: write on the repo).",
        reason: "missing-github-token",
      },
      { status: 501 },
    );
  }

  try {
    const noteBlock =
      commitNote.length > 0
        ? `\n\n— Note —\n${commitNote}`
        : "";
    const result = await commitFiles({
      token: ghToken,
      repo: ghRepo,
      branch: ghBranch,
      message: `admin: update works, products & people\n\nBy ${session.email} via /admin.${noteBlock}`,
      authorName: "nxyz admin",
      authorEmail: session.email,
      files: [
        { path: "site/content/works.json", content: worksJson },
        { path: "site/content/products.json", content: productsJson },
        { path: "site/content/people.json", content: peopleJson },
      ],
    });
    return NextResponse.json({
      ok: true,
      mode: "github",
      commit: result.commitSha,
      commitUrl: result.commitUrl,
      message:
        "Committed to main. Vercel will rebuild and serve new content in ~30s.",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `GitHub commit failed: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
