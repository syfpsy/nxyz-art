import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { AdminShell } from "@/components/admin-editor";

export const metadata: Metadata = {
  title: "Admin — nxyz studio",
  description: "Studio content editor.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * /admin is a single surface — the client shell handles the login form,
 * the editor, and post-save UX.
 *
 * The API endpoints are the real security boundary, but we also do a
 * server-side session probe here so authenticated visitors don't see a
 * flicker of the login form, and unauthenticated visitors get a
 * pre-rendered login-only shell without the editor's client code loaded
 * in the initial payload.
 */
export default async function AdminPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = raw ? verifySession(raw) : null;
  const initial = session
    ? {
        phase: "authed" as const,
        session: {
          email: session.email,
          env: (process.env.NODE_ENV !== "production"
            ? "dev"
            : "prod") as "dev" | "prod",
        },
      }
    : { phase: "unauth" as const };

  return (
    <section style={{ padding: "48px 24px 96px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <AdminShell initial={initial} />
      </div>
    </section>
  );
}
