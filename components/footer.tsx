import { STUDIO } from "@/content/studio";
import { Wordmark } from "./wordmark";
import { Grain } from "./grain";

/**
 * Footer as colophon strip — publication end-matter.
 * Inverse surface. One of the two places grain is allowed.
 */
export function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        padding: "40px 24px 32px",
        background: "var(--bg-inverse)",
        color: "var(--fg-inverse)",
        borderTop: "1px solid var(--border-inverse)",
        overflow: "hidden",
      }}
    >
      <Grain />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 3fr 2fr",
          gap: 24,
          alignItems: "end",
        }}
        className="footer-grid"
      >
        <div>
          <Wordmark variant="full" tone="dark" size={22} />
          <div style={{ marginTop: 10 }}>
            <span
              className="t-label"
              style={{ color: "rgba(243,245,247,0.48)" }}
            >
              {STUDIO.domain} · {STUDIO.volume} · {STUDIO.year}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <span
            className="t-label"
            style={{
              color: "rgba(243,245,247,0.48)",
              lineHeight: 1.6,
              textTransform: "uppercase",
            }}
          >
            Set in Space Grotesk &amp; JetBrains Mono. Typeset with care. Printed on the web.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {STUDIO.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="t-label"
              style={{
                color: "rgba(243,245,247,0.72)",
                transition: "color var(--dur-base) var(--ease-standard)",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .footer-grid > * { text-align: left !important; justify-content: flex-start !important; }
        }
      `}</style>
    </footer>
  );
}
