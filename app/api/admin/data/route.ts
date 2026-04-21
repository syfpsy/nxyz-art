import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read current works + products JSON from the deployed filesystem.
 *
 * Works in production because Vercel ships the content JSON with the
 * bundle, and the serverless runtime can read its own files. Writes go
 * through a separate path (see `save/route.ts`).
 */

async function readJson(file: string): Promise<unknown> {
  const full = path.join(process.cwd(), "content", file);
  const raw = await fs.readFile(full, "utf8");
  return JSON.parse(raw);
}

export async function GET() {
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

  try {
    const [works, products] = await Promise.all([
      readJson("works.json"),
      readJson("products.json"),
    ]);
    return NextResponse.json({
      ok: true,
      works,
      products,
      env: process.env.NODE_ENV !== "production" ? "dev" : "prod",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Could not read content: ${(err as Error).message}`,
      },
      { status: 500 },
    );
  }
}
