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
      style={{
        padding: "80px 24px",
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
        gridTemplateColumns: "auto 80px 1fr 1.5fr 1fr auto",
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
