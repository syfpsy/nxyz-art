import { countPeriodicFromWorks } from "@/lib/periodic-counts";
import { Mono } from "./mono";
import { SectionHeader } from "./section-header";

type Element = {
  n: string;
  full: string;
  cat: string;
  accent?: boolean;
};

const ELEMENTS: Element[] = [
  { n: "Mt", full: "Motion", cat: "moving image", accent: true },
  { n: "Ti", full: "Title design", cat: "moving image" },
  { n: "Id", full: "Identity", cat: "systems" },
  { n: "Ty", full: "Type design", cat: "systems" },
  { n: "Ui", full: "Interface", cat: "product" },
  { n: "Pr", full: "Prototype", cat: "product", accent: true },
  { n: "Ed", full: "Editorial", cat: "publications" },
  { n: "Ar", full: "Archive", cat: "publications" },
  { n: "Ex", full: "Experiment", cat: "research" },
  { n: "Ss", full: "Sound", cat: "research" },
  { n: "Tl", full: "Tool", cat: "research" },
  { n: "Cd", full: "Creative dir.", cat: "direction", accent: true },
];

/**
 * Capabilities as a "periodic table" of studio outputs.
 * One of the most recognizable components in the prototype.
 */
export function PeriodicTable() {
  const counts = countPeriodicFromWorks();
  return (
    <section
      style={{
        padding: "56px 24px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <SectionHeader index="DISCIPLINES" prefix="APPENDIX" meta="Live counts from archive">
          Twelve practices, one studio. Counts infer how many works touch each practice
          (keywords in kind, role, and summary). Highlighted in{" "}
          <span style={{ color: "var(--accent)" }}>violet</span> are the three emphasis tiles.
        </SectionHeader>

        <div
          className="pt-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
          }}
        >
          {ELEMENTS.map((el) => {
            const count = counts[el.n] ?? 0;
            // Accent tiles pull their ink from --accent-on-soft, which flips
            // to a lifted violet in dark mode. This keeps the tile readable
            // when --accent-soft becomes a translucent tint over near-black.
            const accentInk = el.accent
              ? "var(--accent-on-soft)"
              : "var(--fg-tertiary)";
            const primaryInk = el.accent
              ? "var(--accent-on-soft)"
              : "var(--fg-primary)";
            return (
              <div
                key={el.n}
                style={{
                  aspectRatio: "1 / 1",
                  padding: 14,
                  background: el.accent
                    ? "var(--accent-soft)"
                    : "var(--bg-elevated)",
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
                  <Mono style={{ color: accentInk, fontSize: 9 }}>
                    {String(count).padStart(3, "0")}
                  </Mono>
                  <Mono style={{ color: accentInk, fontSize: 9 }}>{el.cat}</Mono>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      fontSize: "clamp(42px, 5vw, 72px)",
                      letterSpacing: "-0.04em",
                      lineHeight: 0.9,
                      color: primaryInk,
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
                      color: primaryInk,
                    }}
                  >
                    {el.full}
                  </div>
                </div>
              </div>
            );
          })}
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
