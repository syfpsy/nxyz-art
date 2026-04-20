import { Mono } from "./mono";
import { SectionHeader } from "./section-header";

type Element = {
  n: string;
  full: string;
  cat: string;
  count: number;
  accent?: boolean;
};

const ELEMENTS: Element[] = [
  { n: "Mt", full: "Motion",        cat: "moving image", count: 14, accent: true },
  { n: "Ti", full: "Title design",  cat: "moving image", count:  6 },
  { n: "Id", full: "Identity",      cat: "systems",      count:  9 },
  { n: "Ty", full: "Type design",   cat: "systems",      count:  4 },
  { n: "Ui", full: "Interface",     cat: "product",      count:  7 },
  { n: "Pr", full: "Prototype",     cat: "product",      count: 12, accent: true },
  { n: "Ed", full: "Editorial",     cat: "publications", count:  5 },
  { n: "Ar", full: "Archive",       cat: "publications", count:  3 },
  { n: "Ex", full: "Experiment",    cat: "research",     count: 22 },
  { n: "Ss", full: "Sound",         cat: "research",     count:  2 },
  { n: "Tl", full: "Tool",          cat: "research",     count:  4 },
  { n: "Cd", full: "Creative dir.", cat: "direction",    count: 18, accent: true },
];

/**
 * Capabilities as a "periodic table" of studio outputs.
 * One of the most recognizable components in the prototype.
 */
export function PeriodicTable() {
  return (
    <section
      style={{
        padding: "80px 24px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <SectionHeader index="DISCIPLINES" prefix="APPENDIX" meta="12 practices">
          Twelve practices, one studio. Highlighted in{" "}
          <span style={{ color: "var(--accent)" }}>violet</span> are active this quarter.
        </SectionHeader>

        <div
          className="pt-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {ELEMENTS.map((el) => (
            <div
              key={el.n}
              style={{
                aspectRatio: "1 / 1",
                padding: 14,
                background: el.accent ? "var(--accent-soft)" : "var(--bg-elevated)",
                border:
                  "1px solid " +
                  (el.accent ? "var(--accent)" : "var(--border-subtle)"),
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Mono
                  style={{
                    color: el.accent
                      ? "var(--accent-deep)"
                      : "var(--fg-tertiary)",
                    fontSize: 9,
                  }}
                >
                  {String(el.count).padStart(3, "0")}
                </Mono>
                <Mono
                  style={{
                    color: el.accent
                      ? "var(--accent-deep)"
                      : "var(--fg-tertiary)",
                    fontSize: 9,
                  }}
                >
                  {el.cat}
                </Mono>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "clamp(42px, 5vw, 72px)",
                    letterSpacing: "-0.04em",
                    lineHeight: 0.9,
                    color: el.accent
                      ? "var(--accent-deep)"
                      : "var(--fg-primary)",
                  }}
                >
                  {el.n}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: 14,
                    letterSpacing: "-0.01em",
                    marginTop: 4,
                    color: el.accent
                      ? "var(--accent-deep)"
                      : "var(--fg-primary)",
                  }}
                >
                  {el.full}
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 720px) {
            .pt-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
