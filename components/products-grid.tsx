import Link from "next/link";
import { PRODUCTS, type Product } from "@/content/products";
import { Mono } from "./mono";
import { SectionHeader } from "./section-header";
import { BrowserFrame } from "./browser-frame";

/**
 * Home-page "Shop" section — the studio's running software.
 * A 2-up grid of live embed cards. Each card routes to its /products/[slug] page.
 */
export function ProductsGrid() {
  return (
    <section
      id="software"
      aria-label="Software from the studio"
      style={{
        padding: "64px 24px",
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          minWidth: 0,
        }}
      >
        <SectionHeader index="B" meta="SHIPPING">
          Software from the studio &mdash; running in public, charging little or
          nothing, built to stand on their own.
        </SectionHeader>

        <div
          className="products-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 20,
          }}
        >
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.slug} p={p} staggerFrames={i} />
          ))}
        </div>

        <style>{`
          @media (max-width: 860px) {
            .products-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

function ProductCard({
  p,
  staggerFrames,
}: {
  p: Product;
  staggerFrames: number;
}) {
  return (
    <Link
      href={`/products/${p.slug}`}
      className="product-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: "inherit",
        position: "relative",
        minWidth: 0,
      }}
    >
      <BrowserFrame product={p} variant="card" staggerFrames={staggerFrames} />

      <div style={{ padding: "2px 2px 0", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 6,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              minWidth: 0,
            }}
          >
            <Mono style={{ color: "var(--fg-tertiary)" }}>{p.n}</Mono>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: "-0.025em",
                display: "inline-flex",
                alignItems: "baseline",
                gap: 9,
              }}
            >
              {p.name}
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: p.accent,
                  display: "inline-block",
                  transform: "translateY(-2px)",
                }}
              />
            </h3>
          </div>
          <Mono
            style={{
              color: "var(--fg-tertiary)",
              whiteSpace: "nowrap",
            }}
          >
            {p.domain}
          </Mono>
        </div>

        <p
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: 15,
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            color: "var(--fg-primary)",
            textWrap: "pretty",
          }}
        >
          {p.tagline}
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {p.disciplines.slice(0, 3).map((d) => (
            <Mono key={d} style={{ color: "var(--fg-secondary)" }}>
              {d}
            </Mono>
          ))}
          <Mono
            style={{
              color: "var(--fg-tertiary)",
              marginLeft: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {p.statusNote ?? p.status}
          </Mono>
        </div>
      </div>

      <style>{`
        .product-card { transition: transform var(--dur-base) var(--ease-standard); }
        .product-card:hover { transform: translateY(-2px); }
      `}</style>
    </Link>
  );
}
