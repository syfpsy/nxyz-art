import Link from "next/link";
import { EXPERIMENTS } from "@/content/experiments";
import { Mono } from "./mono";
import { SectionHeader } from "./section-header";

export function ExperimentsPreview() {
  const items = EXPERIMENTS.slice(0, 4);
  return (
    <section
      style={{
        padding: "80px 24px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
      }}
    >
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <SectionHeader index="C" prefix="LAB" meta="Sketches & studies">
          Works in progress, studies, and one-offs. Less finished than the archive,
          more current than the colophon.
        </SectionHeader>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 0,
            borderTop: "1px solid var(--border-subtle)",
            borderLeft: "1px solid var(--border-subtle)",
          }}
        >
          {items.map((e) => (
            <Link
              key={e.slug}
              href={`/lab/${e.slug}`}
              className="hover-fill"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: "22px 24px",
                minHeight: 200,
                borderRight: "1px solid var(--border-subtle)",
                borderBottom: "1px solid var(--border-subtle)",
                color: "inherit",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <Mono style={{ color: "var(--fg-tertiary)" }}>LAB · {e.n}</Mono>
                <Mono
                  style={{
                    color:
                      e.status === "open"
                        ? "var(--accent)"
                        : e.status === "archived"
                        ? "var(--fg-tertiary)"
                        : "var(--fg-secondary)",
                  }}
                >
                  · {e.status}
                </Mono>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: 24,
                  letterSpacing: "-0.025em",
                  marginTop: "auto",
                }}
              >
                {e.title}
              </div>
              <div
                className="t-body-sm"
                style={{ color: "var(--fg-secondary)", textWrap: "pretty" }}
              >
                {e.summary}
              </div>
              <Mono style={{ color: "var(--fg-tertiary)" }}>
                {e.kind} · {e.date}
              </Mono>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Link
            href="/lab"
            className="t-label"
            style={{ color: "var(--accent)" }}
          >
            OPEN THE FULL LAB →
          </Link>
        </div>
      </div>
    </section>
  );
}
