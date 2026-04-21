import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS } from "@/content/products";
import { Mono } from "@/components/mono";
import { BrowserFrame } from "@/components/browser-frame";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Software and tools shipped by nxyz studio — PerchLens, Perchi, FontDash, and Refchi.",
};

export default function ProductsArchive() {
  return (
    <>
      <section style={{ padding: "72px 24px 32px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <Mono style={{ color: "var(--fg-tertiary)" }}>SECTION · B</Mono>
          <h1
            className="t-h1"
            style={{ marginTop: 12, fontWeight: 500, maxWidth: 920 }}
          >
            The shop. Running software, made in the studio.
          </h1>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              maxWidth: 640,
              marginTop: 18,
            }}
          >
            A small set of tools the studio builds alongside client work. Each one
            runs in public, charges little or nothing, and is designed to stand on
            its own — not to upsell anything else.
          </p>
        </div>
      </section>

      <section style={{ padding: "32px 24px 96px" }}>
        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 72,
          }}
        >
          {PRODUCTS.map((p, i) => (
            <article
              key={p.slug}
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr",
                gap: 48,
                alignItems: "start",
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: 32,
              }}
              className="product-archive-row"
            >
              <Link href={`/products/${p.slug}`} style={{ color: "inherit" }}>
                <BrowserFrame
                  product={p}
                  variant="card"
                  aspect={i === 0 ? "16 / 10" : "16 / 10"}
                />
              </Link>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  position: "sticky",
                  top: 96,
                }}
                className="product-archive-meta"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <Mono>PRODUCT · {p.n}</Mono>
                  <Mono style={{ color: "var(--fg-secondary)" }}>
                    {p.statusNote ?? p.status}
                  </Mono>
                  <Mono style={{ color: "var(--fg-tertiary)" }}>{p.year}</Mono>
                </div>
                <h2
                  className="t-h2"
                  style={{
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "baseline",
                    gap: 12,
                  }}
                >
                  {p.name}
                  <span
                    aria-hidden
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: p.accent,
                      transform: "translateY(-4px)",
                    }}
                  />
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: 20,
                    lineHeight: 1.35,
                    letterSpacing: "-0.01em",
                    color: "var(--fg-primary)",
                  }}
                >
                  {p.tagline}
                </p>
                <p
                  className="t-body"
                  style={{
                    color: "var(--fg-secondary)",
                    maxWidth: 520,
                    textWrap: "pretty",
                  }}
                >
                  {p.summary}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {p.disciplines.map((d) => (
                    <span
                      key={d}
                      className="t-label"
                      style={{
                        padding: "5px 10px",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 999,
                        color: "var(--fg-secondary)",
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    marginTop: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/products/${p.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 18px",
                      borderRadius: 10,
                      background: "var(--fg-primary)",
                      color: "var(--bg-base)",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      fontSize: 15,
                    }}
                  >
                    Open case ↵
                  </Link>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit ${p.domain} (opens in a new tab)`}
                    className="t-label link"
                    style={{
                      color: "var(--fg-secondary)",
                      padding: "12px 14px",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                    }}
                  >
                    Visit {p.domain} ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <style>{`
          @media (max-width: 860px) {
            .product-archive-row {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
            .product-archive-meta { position: static !important; }
          }
        `}</style>
      </section>
    </>
  );
}
