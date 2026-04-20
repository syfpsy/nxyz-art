import type { Metadata } from "next";
import Link from "next/link";
import { EXPERIMENTS } from "@/content/experiments";
import { Mono } from "@/components/mono";

export const metadata: Metadata = {
  title: "Lab",
  description: "Experiments, sketches, and studies by nxyz studio.",
};

export default function LabIndex() {
  return (
    <>
      <section style={{ padding: "72px 24px 32px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <Mono style={{ color: "var(--fg-tertiary)" }}>SECTION · C</Mono>
          <h1
            className="t-h1"
            style={{ marginTop: 12, fontWeight: 500, maxWidth: 880 }}
          >
            The lab. Studies, sketches, and technical one-offs.
          </h1>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              maxWidth: 640,
              marginTop: 18,
            }}
          >
            A working notebook. Entries are dated, sometimes archived, occasionally
            graduate into the archive proper.
          </p>
        </div>
      </section>

      <section style={{ padding: "24px 24px 96px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {EXPERIMENTS.map((e) => (
              <Link
                key={e.slug}
                href={`/lab/${e.slug}`}
                className="lab-row hover-fill"
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr 1.6fr 140px 100px",
                  gap: 20,
                  alignItems: "center",
                  padding: "18px 16px",
                  borderBottom: "1px solid var(--border-subtle)",
                  color: "inherit",
                  borderRadius: 4,
                }}
              >
                <Mono style={{ color: "var(--fg-tertiary)" }}>{e.n}</Mono>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {e.title}
                </span>
                <span
                  className="t-body-sm"
                  style={{ color: "var(--fg-secondary)", textWrap: "pretty" }}
                >
                  {e.summary}
                </span>
                <Mono style={{ color: "var(--fg-secondary)" }}>{e.kind}</Mono>
                <Mono
                  style={{
                    color:
                      e.status === "open"
                        ? "var(--accent)"
                        : e.status === "archived"
                        ? "var(--fg-tertiary)"
                        : "var(--fg-secondary)",
                    textAlign: "right",
                  }}
                >
                  · {e.status}
                </Mono>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        @media (max-width: 720px) {
          .lab-row {
            grid-template-columns: 48px 1fr auto !important;
          }
          .lab-row > :nth-child(3),
          .lab-row > :nth-child(4) { display: none !important; }
        }
      `}</style>
    </>
  );
}
