import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Dev-only admin data source.
 *
 * In production this route refuses to run — there's no durable filesystem
 * on Vercel's serverless functions anyway, and we don't want an admin
 * endpoint to sit exposed on the public site. The gate is also enforced
 * in the /admin page's UI.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

async function readJson(file: string): Promise<unknown> {
  const full = path.join(process.cwd(), "content", file);
  const raw = await fs.readFile(full, "utf8");
  return JSON.parse(raw);
}

export async function GET() {
  if (!isDev()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin is available only in development. Run `npm run dev` locally.",
      },
      { status: 403 },
    );
  }

  try {
    const [works, products] = await Promise.all([
      readJson("works.json"),
      readJson("products.json"),
    ]);
    return NextResponse.json({ ok: true, works, products });
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
