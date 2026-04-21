import { STUDIO } from "@/content/studio";
import { Mono } from "./mono";
import { Wordmark } from "./wordmark";
import { Grain } from "./grain";
import { StudioMap } from "./studio-map";

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
        {/* Address card — wordmark + map + email. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              // The inner address card is always #0F1115. Its hairlines
              // come from the on-inverse scale so they read against the
              // panel regardless of the surrounding section.
              border: "1px solid var(--border-on-inverse-subtle)",
              borderRadius: 4,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
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
              <Mono style={{ color: "var(--fg-on-inverse-tertiary)" }}>
                CORRESPONDENCE · 04
              </Mono>
              <Mono style={{ color: "var(--accent)" }}>· OPEN</Mono>
            </div>
            <Wordmark variant="full" tone="dark" size={26} />
            <div style={{ height: 1, background: "var(--border-on-inverse-subtle)" }} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <a
                href={`mailto:${STUDIO.email}`}
                style={{
                  color: "var(--fg-on-inverse)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  textDecoration: "none",
                }}
              >
                {STUDIO.email}
              </a>
              <Mono style={{ color: "var(--fg-on-inverse-tertiary)" }}>
                {STUDIO.domain} · est. {STUDIO.established}
              </Mono>
            </div>
          </div>

          <StudioMap tone="inverse" />
        </div>

        {/* Letter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Mono style={{ color: "var(--fg-on-inverse-tertiary)" }}>
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
                // The pill sits on the always-dark correspondence stripe.
                // Its face uses the inverse foreground (always light) and
                // its text uses the always-dark ink — hardcoded so dark
                // mode doesn't flip it to light-on-light.
                background: "var(--fg-inverse)",
                color: "#111214",
                textDecoration: "none",
              }}
            >
              Write to the studio{" "}
              <Mono style={{ color: "rgba(17,18,20,0.55)", fontSize: 10 }}>↵</Mono>
            </a>
            <Mono style={{ color: "var(--fg-on-inverse-tertiary)" }}>
              {STUDIO.status.replySla}
            </Mono>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              borderTop: "1px solid var(--border-on-inverse-subtle)",
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
                <Mono style={{ color: "var(--fg-on-inverse-tertiary)", marginTop: 4, display: "block" }}>
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
