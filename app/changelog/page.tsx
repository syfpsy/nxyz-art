import type { Metadata } from "next";
import Link from "next/link";
import changelog from "@/content/changelog.json";
import { Mono } from "@/components/mono";

export const metadata: Metadata = {
  title: "Changelog · nxyz",
  description: "Edits to the public archive — sourced from content commits.",
};

type Entry = { date: string; title: string; detail: string };

export default function ChangelogPage() {
  const entries = (changelog as { entries: Entry[] }).entries;
  return (
    <article style={{ padding: "56px 24px 96px" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <Mono style={{ color: "var(--fg-tertiary)" }}>MAINTENANCE · LOG</Mono>
        <h1 className="t-h1" style={{ fontWeight: 500, marginTop: 12, maxWidth: 640 }}>
          Changelog
        </h1>
        <p
          className="t-body"
          style={{
            color: "var(--fg-secondary)",
            maxWidth: 560,
            marginTop: 16,
            lineHeight: 1.55,
          }}
        >
          A human-readable trace of what changed in the site&rsquo;s content layer.
          Entries are maintained alongside <Mono>content/*.json</Mono> — not scraped
          from git in CI (that would need a token at build time). Update this file when
          you ship something worth noting.
        </p>

        <ol
          style={{
            margin: "40px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {entries.map((e) => (
            <li
              key={e.date + e.title}
              style={{
                padding: "24px 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <Mono style={{ color: "var(--fg-tertiary)", fontSize: 12 }}>
                {e.date}
              </Mono>
              <h2
                className="t-h2"
                style={{
                  fontWeight: 500,
                  fontSize: 22,
                  marginTop: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                {e.title}
              </h2>
              <p
                className="t-body"
                style={{
                  color: "var(--fg-secondary)",
                  marginTop: 10,
                  maxWidth: 640,
                  lineHeight: 1.55,
                }}
              >
                {e.detail}
              </p>
            </li>
          ))}
        </ol>

        <p style={{ marginTop: 40 }}>
          <Link href="/" className="t-label link" style={{ color: "var(--fg-secondary)" }}>
            ← Home
          </Link>
        </p>
      </div>
    </article>
  );
}
