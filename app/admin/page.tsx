import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-editor";

export const metadata: Metadata = {
  title: "Admin — nxyz studio",
  description: "Studio content editor.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * /admin is a single surface — the client-side shell handles the
 * login form, the editor, and post-save UX.
 *
 * The route is not gated here at the server level: the API endpoints
 * it calls all perform their own session check, which is where the
 * real security boundary lives.
 */
export default function AdminPage() {
  return (
    <section style={{ padding: "48px 24px 96px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <AdminShell />
      </div>
    </section>
  );
}
