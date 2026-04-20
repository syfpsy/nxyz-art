import Link from "next/link";
import { Mono } from "@/components/mono";

export default function NotFound() {
  return (
    <section style={{ padding: "120px 24px", minHeight: "60dvh" }}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <Mono>ERROR · 404 · NOT FOUND</Mono>
        <h1
          className="t-h1"
          style={{ fontWeight: 500, letterSpacing: "-0.02em" }}
        >
          Nothing filed under that call number.
        </h1>
        <p className="t-body" style={{ color: "var(--fg-secondary)" }}>
          The page you&rsquo;re after isn&rsquo;t in the archive. Try the index,
          or search the catalog with <Mono>⌘K</Mono>.
        </p>
        <div style={{ display: "flex", gap: 14 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              padding: "12px 18px",
              borderRadius: 10,
              background: "var(--fg-primary)",
              color: "var(--bg-base)",
            }}
          >
            Back to index
          </Link>
          <Link
            href="/work"
            className="link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 18px",
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              color: "var(--fg-primary)",
            }}
          >
            Browse work →
          </Link>
        </div>
      </div>
    </section>
  );
}
