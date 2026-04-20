import type { Metadata } from "next";
import { STUDIO } from "@/content/studio";
import { Mono } from "@/components/mono";
import { Correspondence } from "@/components/correspondence";

export const metadata: Metadata = {
  title: "Colophon",
  description:
    "About nxyz studio: where we are, what we use, and how we work.",
};

export default function Colophon() {
  return (
    <>
      <section style={{ padding: "72px 24px 32px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <Mono style={{ color: "var(--fg-tertiary)" }}>SECTION · E</Mono>
          <h1
            className="t-h1"
            style={{ marginTop: 12, fontWeight: 500, maxWidth: 880 }}
          >
            Colophon. A short account of the studio.
          </h1>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              maxWidth: 720,
              marginTop: 18,
            }}
          >
            nxyz studio is a small practice working across motion, systems, and
            digital products. It was established in {STUDIO.established} and
            operates out of {STUDIO.city}. This page reads like the back of a book
            &mdash; what the studio is made of, and what it uses to work.
          </p>
        </div>
      </section>

      <section style={{ padding: "24px 24px 64px" }}>
        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 24,
          }}
          className="col-grid"
        >
          <Block label="Studio" span={4}>
            <Line k="Name" v={STUDIO.name} />
            <Line k="Mark" v={STUDIO.mark} />
            <Line k="Domain" v={STUDIO.domain} />
            <Line k="Established" v={String(STUDIO.established)} />
            <Line k="Location" v={`${STUDIO.city}, ${STUDIO.country}`} />
            <Line k="Coordinates" v={STUDIO.coords} />
          </Block>

          <Block label="Correspondence" span={4}>
            <Line k="Email" v={STUDIO.email} />
            <Line k="Status" v={STUDIO.status.note} />
            <Line k="Reply" v={STUDIO.status.replySla} />
            {STUDIO.address.map((l, i) => (
              <Line key={l} k={i === 0 ? "Address" : ""} v={l} />
            ))}
          </Block>

          <Block label="Type" span={4}>
            {STUDIO.typefaces.map((t) => (
              <Line key={t.name} k={t.name} v={`${t.role} · ${t.source}`} />
            ))}
            <Line k="Body measure" v="640 px max" />
            <Line k="Grid" v="12 col · 24 gutter · 1280 max" />
            <Line k="Motion" v="220ms · cubic-bezier(.22,1,.36,1)" />
          </Block>

          <Block label="Tools" span={6}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STUDIO.tools.map((t) => (
                <span
                  key={t}
                  className="t-label"
                  style={{
                    border: "1px solid var(--border-subtle)",
                    color: "var(--fg-secondary)",
                    padding: "6px 10px",
                    borderRadius: 999,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Block>

          <Block label="Principles" span={6}>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                color: "var(--fg-primary)",
              }}
            >
              {[
                "Typography carries the brand.",
                "One accent, used rarely.",
                "Premium comes from editing, not effects.",
                "Restraint is the shape of ambition.",
                "Publish when the thought has cooled.",
              ].map((p) => (
                <li key={p} style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--accent)" }}>·</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Block>
        </div>

        <style>{`
          @media (max-width: 960px) {
            .col-grid > * { grid-column: span 12 !important; }
          }
        `}</style>
      </section>

      <Correspondence withGrain />
    </>
  );
}

function Block({
  label,
  span,
  children,
}: {
  label: string;
  span: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        gridColumn: `span ${span}`,
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: 24,
        background: "var(--bg-elevated)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <Mono style={{ color: "var(--fg-tertiary)" }}>{label}</Mono>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 12,
        paddingBottom: 10,
        borderBottom: "1px dashed var(--border-subtle)",
      }}
    >
      <Mono style={{ color: "var(--fg-tertiary)" }}>{k}</Mono>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          color: "var(--fg-primary)",
        }}
      >
        {v}
      </span>
    </div>
  );
}
