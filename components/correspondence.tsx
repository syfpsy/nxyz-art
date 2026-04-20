import { STUDIO } from "@/content/studio";
import { Mono } from "./mono";
import { Wordmark } from "./wordmark";
import { Grain } from "./grain";

/**
 * Contact / about CTA styled as a correspondence — a letter, not a form.
 * Inverse surface. Grain permitted once per page; the footer already has some —
 * so this uses it too only when it's the last section before the footer.
 */
type Props = {
  withGrain?: boolean;
};

export function Correspondence({ withGrain = false }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section
      aria-label="Correspondence"
      style={{
        position: "relative",
        padding: "80px 24px",
        background: "var(--bg-inverse)",
        color: "var(--fg-inverse)",
        overflow: "hidden",
      }}
    >
      {withGrain && <Grain />}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: 48,
        }}
        className="corr-grid"
      >
        {/* Address card */}
        <div
          style={{
            border: "1px solid var(--border-inverse)",
            borderRadius: 4,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            background: "#0F1115",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <Mono style={{ color: "rgba(243,245,247,0.5)" }}>
              CORRESPONDENCE · 04
            </Mono>
            <Mono style={{ color: "var(--accent)" }}>· OPEN</Mono>
          </div>
          <Wordmark variant="full" tone="dark" size={28} />
          <div style={{ height: 1, background: "var(--border-inverse)" }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "rgba(243,245,247,0.56)",
              letterSpacing: "0.02em",
            }}
          >
            {STUDIO.address.map((l) => (
              <div key={l}>{l}</div>
            ))}
            <div style={{ color: "var(--fg-inverse)", marginTop: 8 }}>{STUDIO.email}</div>
            <div>
              {STUDIO.domain} · est. {STUDIO.established}
            </div>
          </div>
        </div>

        {/* Letter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Mono style={{ color: "rgba(243,245,247,0.5)" }}>
            DEAR VISITOR, — {today}
          </Mono>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "clamp(36px, 4.5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              textWrap: "balance",
              maxWidth: 640,
            }}
          >
            We take a small number of projects each year. If what we&rsquo;ve made
            resonates, write to us with a short note &mdash; no brief required.
          </h2>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href={`mailto:${STUDIO.email}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 16,
                padding: "14px 20px",
                borderRadius: 10,
                background: "var(--fg-inverse)",
                color: "var(--fg-primary)",
                textDecoration: "none",
              }}
            >
              Write to the studio{" "}
              <Mono style={{ color: "var(--fg-tertiary)", fontSize: 10 }}>↵</Mono>
            </a>
            <Mono style={{ color: "rgba(243,245,247,0.5)" }}>
              {STUDIO.status.replySla}
            </Mono>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              borderTop: "1px solid var(--border-inverse)",
              paddingTop: 18,
            }}
          >
            {[
              ["2026", "now booking"],
              ["04/06", "active works"],
              ["2022", "established"],
            ].map(([k, v]) => (
              <div key={v}>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: 28,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {k}
                </div>
                <Mono style={{ color: "rgba(243,245,247,0.5)", marginTop: 4, display: "block" }}>
                  {v}
                </Mono>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .corr-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
