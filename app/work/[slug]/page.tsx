import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRelatedWorksBySharedCreators } from "@/lib/editorial-links";
import { WORKS, getWork } from "@/content/works";
import { Mono } from "@/components/mono";
import { FrameGlyph, frameBackground } from "@/components/frame-glyph";
import { HlsVideo } from "@/components/hls-video";
import { WorkAttributionStack } from "@/components/work-attribution";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return WORKS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) return { title: "Not found" };
  return {
    title: `${w.title} · ${w.kind.toLowerCase()} · ${w.year}`,
    description: w.summary,
  };
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) notFound();

  const idx = WORKS.findIndex((x) => x.slug === slug);
  const prev = idx > 0 ? WORKS[idx - 1] : WORKS[WORKS.length - 1];
  const next = idx < WORKS.length - 1 ? WORKS[idx + 1] : WORKS[0];
  const sharedCredit = getRelatedWorksBySharedCreators(w, 5);

  return (
    <article>
      {/* Header: dateline + title */}
      <section style={{ padding: "48px 24px 24px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 18,
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: 18,
              alignItems: "baseline",
              flexWrap: "wrap",
            }}
          >
            <Mono>CASE · {w.n}</Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>{w.year}</Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>{w.kind}</Mono>
            {w.dur && (
              <Mono style={{ color: "var(--fg-tertiary)" }}>{w.dur}</Mono>
            )}
            {w.accent && (
              <Mono style={{ color: "var(--accent)" }}>· SIGNATURE</Mono>
            )}
            <Link
              href="/work"
              className="t-label link"
              style={{ marginLeft: "auto", color: "var(--fg-secondary)" }}
            >
              ← back to archive
            </Link>
          </div>

          <h1
            className="t-h1"
            style={{
              marginTop: 28,
              fontWeight: 500,
              maxWidth: 920,
            }}
          >
            {w.title}
            {w.accent && <span style={{ color: "var(--accent)" }}>.</span>}
          </h1>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              maxWidth: 640,
              marginTop: 18,
              fontSize: 17,
              lineHeight: 1.55,
            }}
          >
            {w.summary}
          </p>
        </div>
      </section>

      {/* Hero plate — single full-bleed fragment */}
      <section style={{ padding: "12px 24px 48px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div
            style={{
              position: "relative",
              aspectRatio: "16 / 9",
              borderRadius: 8,
              overflow: "hidden",
              background: w.video ? "#000" : frameBackground(w.tone),
              border: "1px solid var(--border-subtle)",
            }}
          >
            {w.video ? (
              <>
                <HlsVideo
                  src={w.video}
                  playing
                  controls
                  fit="contain"
                  ariaLabel={`${w.title} — ${w.kind.toLowerCase()}`}
                />
                {w.personSlugs?.length ? (
                  <WorkAttributionStack
                    work={w}
                    size={32}
                    position="top-right"
                  />
                ) : null}
              </>
            ) : (
              <>
                <FrameGlyph work={w} />
                {/* Protection gradient — the one acceptable gradient per brand. */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(17,18,20,0.18) 100%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 16,
                    bottom: 16,
                    display: "flex",
                    gap: 10,
                    alignItems: "baseline",
                  }}
                >
                  <Mono style={{ color: "var(--fg-inverse)" }}>{w.n}</Mono>
                  <Mono style={{ color: "rgba(243,245,247,0.64)" }}>
                    {w.kind}
                  </Mono>
                </div>
                {w.personSlugs?.length ? (
                  <WorkAttributionStack
                    work={w}
                    size={32}
                    position="top-right"
                  />
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Meta + body */}
      <section
        style={{
          padding: "48px 24px 72px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(180px, 1fr) 2fr",
            gap: 48,
          }}
          className="case-body"
        >
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              alignSelf: "start",
              position: "sticky",
              top: 96,
            }}
          >
            <Meta label="Year">{String(w.year)}</Meta>
            <Meta label="Kind">{w.kind}</Meta>
            {w.client && <Meta label="Client">{w.client}</Meta>}
            <Meta label="Role">{w.role.join(" · ")}</Meta>
            {w.dur && <Meta label="Runtime">{w.dur}</Meta>}
            <Meta label="Status">
              <span style={{ color: "var(--status-live)" }}>● published</span>
            </Meta>
          </aside>

          <div className="prose">
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 22,
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
                marginBottom: 24,
              }}
            >
              {w.body ??
                "A longer case study is being prepared. In the meantime, the single-sentence thesis above stands."}
            </p>
            {w.body && (
              <p>
                Process notes, stills, and an annotated timeline will follow here.
                If you&rsquo;d like a closer look before they&rsquo;re published,
                write to the studio.
              </p>
            )}
          </div>
        </div>
      </section>

      {sharedCredit.length > 0 && (
        <section
          style={{
            padding: "0 24px 40px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
            <Mono style={{ color: "var(--fg-tertiary)" }}>ALSO CREDITED ON</Mono>
            <p
              className="t-body"
              style={{
                color: "var(--fg-secondary)",
                marginTop: 12,
                maxWidth: 640,
                lineHeight: 1.55,
              }}
            >
              Same creators appear on{" "}
              {sharedCredit.map((o, i) => (
                <span key={o.slug}>
                  {i > 0 &&
                    (i === sharedCredit.length - 1 ? " and " : ", ")}
                  <Link
                    href={`/work/${o.slug}`}
                    className="link"
                    style={{ color: "var(--fg-primary)", fontWeight: 500 }}
                  >
                    {o.title}
                  </Link>
                </span>
              ))}
              .
            </p>
          </div>
        </section>
      )}

      {/* Pager */}
      <section
        style={{
          padding: "28px 24px 72px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <Link
            href={`/work/${prev.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              color: "inherit",
            }}
          >
            <Mono style={{ color: "var(--fg-tertiary)" }}>← PREV · {prev.n}</Mono>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: "-0.02em",
              }}
            >
              {prev.title}
            </span>
          </Link>
          <Link
            href={`/work/${next.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              color: "inherit",
              textAlign: "right",
            }}
          >
            <Mono style={{ color: "var(--fg-tertiary)" }}>NEXT · {next.n} →</Mono>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: "-0.02em",
              }}
            >
              {next.title}
            </span>
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .case-body {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .case-body aside { position: static !important; }
        }
      `}</style>
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Mono style={{ color: "var(--fg-tertiary)" }}>{label}</Mono>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          color: "var(--fg-primary)",
        }}
      >
        {children}
      </span>
    </div>
  );
}
