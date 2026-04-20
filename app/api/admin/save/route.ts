import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Dev-only save endpoint for the admin page.
 *
 * Writes back into `content/works.json` and `content/products.json`.
 * Enforces a minimal schema — missing required fields abort with 400 so
 * a bad form submission can't corrupt the on-disk files.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  works?: unknown;
  products?: unknown;
};

function isDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

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

export async function POST(request: Request) {
  if (!isDev()) {
    return NextResponse.json(
      { ok: false, error: "Admin saves are disabled in production." },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.works) || !Array.isArray(body.products)) {
    return NextResponse.json(
      { ok: false, error: "Body must include `works` and `products` arrays." },
      { status: 400 },
    );
  }

  // Schema-check. Returning the first failure is friendlier than the all-or-
  // nothing of a JSON Schema validator for a handful of fields.
  for (let i = 0; i < body.works.length; i++) {
    const err = validateWork(body.works[i], i);
    if (err) {
      return NextResponse.json({ ok: false, error: err }, { status: 400 });
    }
  }
  for (let i = 0; i < body.products.length; i++) {
    const err = validateProduct(body.products[i], i);
    if (err) {
      return NextResponse.json({ ok: false, error: err }, { status: 400 });
    }
  }

  // All good — write both files atomically-enough for single-user dev use.
  try {
    const worksPath = path.join(process.cwd(), "content", "works.json");
    const productsPath = path.join(process.cwd(), "content", "products.json");
    await Promise.all([
      fs.writeFile(
        worksPath,
        JSON.stringify(body.works, null, 2) + "\n",
        "utf8",
      ),
      fs.writeFile(
        productsPath,
        JSON.stringify(body.products, null, 2) + "\n",
        "utf8",
      ),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Failed to write: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
