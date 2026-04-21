import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/content/products";
import { Mono } from "@/components/mono";
import { BrowserFrame } from "@/components/browser-frame";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.name} · ${p.tagline}`,
    description: p.summary,
    openGraph: {
      title: p.name,
      description: p.tagline,
      url: p.url,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  const idx = PRODUCTS.findIndex((x) => x.slug === slug);
  const prev = idx > 0 ? PRODUCTS[idx - 1] : PRODUCTS[PRODUCTS.length - 1];
  const next = idx < PRODUCTS.length - 1 ? PRODUCTS[idx + 1] : PRODUCTS[0];

  return (
    <article>
      {/* Header */}
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
            <Mono>PRODUCT · {p.n}</Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>{p.year}</Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>
              {p.statusNote ?? p.status}
            </Mono>
            <Mono style={{ color: "var(--fg-tertiary)" }}>{p.domain}</Mono>
            <Link
              href="/products"
              className="t-label link"
              style={{ marginLeft: "auto", color: "var(--fg-secondary)" }}
            >
              ← back to shop
            </Link>
          </div>

          <h1
            className="t-h1"
            style={{
              marginTop: 28,
              fontWeight: 500,
              maxWidth: 960,
              display: "inline-flex",
              alignItems: "baseline",
              gap: 14,
            }}
          >
            {p.name}
            <span
              aria-hidden
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: p.accent,
                transform: "translateY(-8px)",
                boxShadow: `0 0 0 6px ${hexWithAlpha(p.accent, 0.14)}`,
              }}
            />
          </h1>
          <p
            style={{
              marginTop: 18,
              color: "var(--fg-secondary)",
              maxWidth: 720,
              fontSize: 22,
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              fontWeight: 500,
              textWrap: "balance",
            }}
          >
            {p.tagline}
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Visit ${p.domain} (opens in a new tab)`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 20px",
                borderRadius: 10,
                background: "var(--fg-primary)",
                color: "var(--bg-base)",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              Visit {p.domain} ↗
            </a>
            <Mono style={{ color: "var(--fg-tertiary)" }}>
              {p.pricing ?? "Free"}
            </Mono>
          </div>
        </div>
      </section>

      {/* Live embed */}
      <section style={{ padding: "24px 24px 64px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <BrowserFrame product={p} variant="detail" aspect="16 / 10" />
          <Mono
            style={{
              color: "var(--fg-tertiary)",
              marginTop: 12,
              display: "block",
              textAlign: "right",
            }}
          >
            Live preview · {p.domain}
          </Mono>
        </div>
      </section>

      {/* Body — meta + write-up */}
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
            gridTemplateColumns: "minmax(200px, 1fr) 2fr",
            gap: 48,
          }}
          className="product-body"
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
            <Meta label="Status">{p.statusNote ?? p.status}</Meta>
            <Meta label="Year">{String(p.year)}</Meta>
            <Meta label="Disciplines">{p.disciplines.join(" · ")}</Meta>
            {p.platforms && (
              <Meta label="Platforms">{p.platforms.join(" · ")}</Meta>
            )}
            {p.pricing && <Meta label="Pricing">{p.pricing}</Meta>}
            <Meta label="Domain">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${p.domain} in a new tab`}
                className="link hover-accent"
                style={{ color: "var(--fg-primary)" }}
              >
                {p.domain} ↗
              </a>
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
              {p.summary}
            </p>

            {p.features && p.features.length > 0 && (
              <>
                <h3>Highlights</h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {p.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        gap: 12,
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: p.accent,
                          marginTop: 8,
                        }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

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
            href={`/products/${prev.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              color: "inherit",
            }}
          >
            <Mono style={{ color: "var(--fg-tertiary)" }}>
              ← PREV · {prev.n}
            </Mono>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: "-0.02em",
              }}
            >
              {prev.name}
            </span>
          </Link>
          <Link
            href={`/products/${next.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              color: "inherit",
              textAlign: "right",
            }}
          >
            <Mono style={{ color: "var(--fg-tertiary)" }}>
              NEXT · {next.n} →
            </Mono>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: "-0.02em",
              }}
            >
              {next.name}
            </span>
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .product-body {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .product-body aside { position: static !important; }
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

function hexWithAlpha(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
