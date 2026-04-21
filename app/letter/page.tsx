import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { STUDIO } from "@/content/studio";
import { Mono } from "@/components/mono";

const Subscribe = dynamic(
  () => import("@/components/subscribe").then((m) => ({ default: m.Subscribe })),
  { ssr: true },
);

export const metadata: Metadata = {
  title: "Slow correspondence · nxyz",
  description: "A letter before the form — write to the studio.",
};

export default function SlowLetterPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <article
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: 640,
          margin: "0 auto",
          padding: "clamp(40px, 8vw, 72px) 24px 48px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Mono style={{ color: "var(--fg-tertiary)" }}>SLOW CORRESPONDENCE · OPEN</Mono>
        <p
          className="t-mono"
          style={{
            color: "var(--fg-secondary)",
            marginTop: 20,
            fontSize: 12,
            letterSpacing: "0.08em",
          }}
        >
          {today} · {STUDIO.address[2] ?? STUDIO.address[1]}
        </p>

        <div
          style={{
            marginTop: 48,
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(18px, 2.2vw, 22px)",
            lineHeight: 1.65,
            letterSpacing: "-0.015em",
            color: "var(--fg-primary)",
            fontWeight: 400,
          }}
        >
          <p style={{ margin: "0 0 1.35em" }}>
            We read everything. Not on the hour — on the week. If you are writing about
            work, a collaboration, or something that doesn&rsquo;t fit a contact form,
            this page is for you.
          </p>
          <p style={{ margin: "0 0 1.35em" }}>
            Say what you need in plain language. No subject line theatre. We&rsquo;ll
            reply from the same thread, usually with fewer words than you sent.
          </p>
          <p style={{ margin: "0 0 1.35em", color: "var(--fg-secondary)" }}>
            The field below appears after the letter so the letter stays the first
            gesture — not a funnel.
          </p>
        </div>

        <div
          style={{
            marginTop: 56,
            paddingTop: 32,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <Mono style={{ color: "var(--fg-tertiary)" }}>REPLY · 01</Mono>
          <div style={{ marginTop: 20 }}>
            <Subscribe />
          </div>
        </div>

        <p style={{ marginTop: 48 }}>
          <Link href="/" className="t-label link" style={{ color: "var(--fg-secondary)" }}>
            ← Home
          </Link>
        </p>
      </div>
    </article>
  );
}
