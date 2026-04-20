import type { Metadata } from "next";
import { AdminEditor } from "@/components/admin-editor";

export const metadata: Metadata = {
  title: "Admin — nxyz studio",
  description: "Studio content editor.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * /admin is a development-only editor for content. The route exists in
 * production too, but it prints a notice and does not call the API —
 * the paired admin APIs refuse to serve outside of dev regardless.
 */
export default function AdminPage() {
  const isDev = process.env.NODE_ENV !== "production";
  return (
    <section style={{ padding: "48px 24px 96px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderBottom: "1px solid var(--fg-primary)",
            paddingBottom: 14,
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span className="t-label" style={{ color: "var(--fg-tertiary)" }}>
              STUDIO · MAINTENANCE · LOCAL ONLY
            </span>
            <h1
              className="t-h1"
              style={{
                fontWeight: 500,
                marginTop: 6,
                letterSpacing: "-0.02em",
              }}
            >
              Content console
            </h1>
          </div>
          <span
            className="t-label"
            style={{
              color: isDev ? "var(--accent)" : "var(--fg-tertiary)",
              whiteSpace: "nowrap",
            }}
          >
            {isDev ? "● DEV · WRITES ENABLED" : "○ PROD · READ-ONLY"}
          </span>
        </header>

        {isDev ? (
          <AdminEditor />
        ) : (
          <ProductionNotice />
        )}
      </div>
    </section>
  );
}

function ProductionNotice() {
  return (
    <div
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        padding: 32,
        background: "var(--bg-elevated)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <span
        className="t-label"
        style={{ color: "var(--fg-tertiary)" }}
      >
        NOTICE · 01
      </span>
      <h2
        className="t-h2"
        style={{ fontWeight: 500, letterSpacing: "-0.02em" }}
      >
        The admin runs locally, not in production.
      </h2>
      <p
        className="t-body"
        style={{ color: "var(--fg-secondary)", maxWidth: 640 }}
      >
        Content lives in the git repository, not in a database — so edits have
        to happen in your working copy. Run <code>npm run dev</code> in{" "}
        <code>site/</code>, open{" "}
        <a href="http://localhost:3000/admin" style={{ color: "var(--accent)" }}>
          localhost:3000/admin
        </a>
        , make changes, commit, and ship the new build when you&rsquo;re ready.
      </p>
      <ol
        style={{
          margin: 0,
          paddingLeft: 20,
          color: "var(--fg-primary)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          lineHeight: 1.55,
        }}
      >
        <li>
          <code>cd site &amp;&amp; npm run dev</code>
        </li>
        <li>
          Open <code>localhost:3000/admin</code> and edit.
        </li>
        <li>
          Save. The editor writes to <code>content/works.json</code> and{" "}
          <code>content/products.json</code>.
        </li>
        <li>
          <code>git diff</code> to review, then commit and push when ready.
        </li>
      </ol>
    </div>
  );
}
