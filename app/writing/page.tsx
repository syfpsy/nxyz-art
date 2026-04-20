import type { Metadata } from "next";
import Link from "next/link";
import { WRITING } from "@/content/writing";
import { Mono } from "@/components/mono";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes from nxyz studio on motion, systems, restraint, and the business of a small creative practice.",
};

export default function WritingIndex() {
  return (
    <>
      <section style={{ padding: "72px 24px 32px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <Mono style={{ color: "var(--fg-tertiary)" }}>SECTION · D</Mono>
          <h1
            className="t-h1"
            style={{ marginTop: 12, fontWeight: 500, maxWidth: 880 }}
          >
            Notes from the studio.
          </h1>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              maxWidth: 640,
              marginTop: 18,
            }}
          >
            Short, dated writing on what we make and how we make it. Published when
            the thought has cooled, not when it is hot.
          </p>
        </div>
      </section>

      <section style={{ padding: "24px 24px 96px" }}>
        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {WRITING.map((w) => (
            <Link
              key={w.slug}
              href={`/writing/${w.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: 24,
                alignItems: "baseline",
                padding: "28px 0",
                borderBottom: "1px solid var(--border-subtle)",
                color: "inherit",
                transition: "opacity var(--dur-base) var(--ease-standard)",
              }}
              className="writing-row"
            >
              <Mono style={{ color: "var(--fg-tertiary)" }}>{w.date}</Mono>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  maxWidth: 720,
                }}
              >
                <h2
                  className="t-h3"
                  style={{ fontWeight: 500, letterSpacing: "-0.02em" }}
                >
                  {w.title}
                </h2>
                <p
                  className="t-body"
                  style={{
                    color: "var(--fg-secondary)",
                    textWrap: "pretty",
                  }}
                >
                  {w.dek}
                </p>
              </div>
              <Mono style={{ color: "var(--fg-tertiary)" }}>
                {w.readingMinutes} min
              </Mono>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .writing-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .writing-row > :last-child { display: none; }
        }
      `}</style>
    </>
  );
}
