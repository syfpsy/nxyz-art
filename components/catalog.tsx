import Link from "next/link";
import { WORKS, type Work } from "@/content/works";
import { Mono } from "./mono";
import { SectionHeader } from "./section-header";

type CatalogProps = {
  index?: string;                // default "A"
  indexMeta?: string;            // default auto-range
  title?: React.ReactNode;
  items?: Work[];                // default all
};

export function Catalog({ index = "A", indexMeta, title, items }: CatalogProps) {
  const list = items ?? WORKS;
  const meta =
    indexMeta ??
    (list.length > 0
      ? `${list[list.length - 1].year} – ${list[0].year}`
      : "");

  return (
    <section
      className="catalog-section"
      style={{
        padding: "clamp(48px, 10vw, 80px) clamp(16px, 4vw, 24px)",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <SectionHeader index={index} meta={meta}>
          {title ?? (
            <>
              A catalog of projects, filed by year, cross-referenced by medium. Works on
              paper are marked <span style={{ color: "var(--accent)" }}>●</span>.
            </>
          )}
        </SectionHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((w) => (
            <CatalogRow key={w.slug} w={w} />
          ))}
        </div>
      </div>

      {/* Reflow rules — the 6-col grid collapses to a 2-row card under 780px,
          then to a tight stacked card under 540px. Punched-holes are dropped
          below 540px to conserve horizontal space. */}
      <style>{`
        .catalog-row {
          max-width: 100%;
          box-sizing: border-box;
        }
        .catalog-row > * {
          min-width: 0;
        }
        .catalog-title-cell {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        @media (max-width: 780px) {
          .catalog-row {
            grid-template-columns: auto 60px minmax(0, 1fr) auto !important;
            grid-template-areas:
              "holes n title year"
              "holes n kind dur" !important;
            gap: 12px 14px !important;
            padding: 14px clamp(12px, 3vw, 16px) !important;
          }
          .catalog-row > :nth-child(1) { grid-area: holes; }
          .catalog-row > :nth-child(2) { grid-area: n; }
          .catalog-row > :nth-child(3) { grid-area: title; font-size: 22px !important; }
          .catalog-row > :nth-child(4) { grid-area: kind; }
          .catalog-row > :nth-child(5) { grid-area: dur; text-align: right; }
          .catalog-row > :nth-child(6) { grid-area: year; text-align: right; }
        }
        @media (max-width: 540px) {
          .catalog-row {
            grid-template-columns: 44px minmax(0, 1fr) auto !important;
            grid-template-areas:
              "n title year"
              "n kind  dur"  !important;
            gap: 10px 12px !important;
            padding: 12px clamp(10px, 3vw, 14px) !important;
          }
          .catalog-row > :nth-child(1) { display: none !important; }
          .catalog-row > :nth-child(3) { font-size: clamp(17px, 4.5vw, 19px) !important; }
          .catalog-row > :nth-child(4),
          .catalog-row > :nth-child(5) {
            font-size: 11px !important;
          }
        }
      `}</style>
    </section>
  );
}

function CatalogRow({ w }: { w: Work }) {
  return (
    <Link
      href={`/work/${w.slug}`}
      className="hover-row catalog-row"
      style={{
        display: "grid",
        gridTemplateColumns:
          "auto 80px minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr) auto",
        gap: 24,
        alignItems: "center",
        padding: "18px 22px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 4,
        cursor: "pointer",
        position: "relative",
        color: "inherit",
      }}
    >
      {/* Punched holes — a library-catalog cue */}
      <div
        aria-hidden
        style={{ display: "flex", flexDirection: "column", gap: 5 }}
      >
        {[0, 1].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
            }}
          />
        ))}
      </div>
      <Mono
        style={{
          color: "var(--fg-tertiary)",
          fontSize: 22,
          letterSpacing: "0.1em",
        }}
      >
        {w.n}
      </Mono>
      <div
        className="catalog-title-cell"
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "-0.025em",
          display: "flex",
          alignItems: "baseline",
          gap: 10,
        }}
      >
        {w.title}
        {w.accent && (
          <span style={{ color: "var(--accent)", fontSize: 14 }}>●</span>
        )}
      </div>
      <Mono style={{ color: "var(--fg-secondary)" }}>{w.kind}</Mono>
      <Mono style={{ color: "var(--fg-tertiary)" }}>
        {w.dur ?? "static · n/a"}
      </Mono>
      <Mono
        style={{ color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}
      >
        {w.year}
      </Mono>
    </Link>
  );
}
