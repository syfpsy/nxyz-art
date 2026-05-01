"use client";

import { useCallback, useState, type CSSProperties } from "react";
import Link from "next/link";
import { PRODUCTS, type Product } from "@/content/products";
import { useHorizontalMarqueeStrip } from "@/hooks/use-horizontal-marquee-strip";
import {
  MARQUEE_INTERACTION_HINT,
} from "@/lib/marquee-sidebar-copy";
import {
  dominantStripFrameIndex,
  scrollStripFrameIntoView,
} from "@/lib/scroll-strip-frame";
import { BrowserFrame } from "./browser-frame";
import { Mono } from "./mono";

/** Horizontal crawl for the apps row (px/s) — slightly calmer than the work filmstrip. */
const APPS_STRIP_AUTO_SCROLL_PX = 9;

export function ProductMarqueeStrip({
  reduceMotion,
}: {
  reduceMotion: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  const syncActive = useCallback((strip: HTMLElement) => {
    const nextActive = dominantStripFrameIndex(strip, "data-appframe");
    setActiveIdx((prev) => (prev === nextActive ? prev : nextActive));
  }, []);

  const {
    stripRef,
    innerRef,
    pauseAutoScroll,
    scheduleResume,
    onPointerDown,
    onPointerMove,
    endDrag,
    onWheel,
    onScrollStrip,
    suppressClickIfDragged,
    isPointerDragActive,
  } = useHorizontalMarqueeStrip({
    reduceMotion,
    autoScrollPxPerSecond: APPS_STRIP_AUTO_SCROLL_PX,
    syncFromStrip: syncActive,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    let next: number | null = null;
    if (e.key === "ArrowRight") {
      next = Math.min(PRODUCTS.length - 1, activeIdx + 1);
    } else if (e.key === "ArrowLeft") {
      next = Math.max(0, activeIdx - 1);
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = PRODUCTS.length - 1;
    } else if (/^[1-9]$/.test(e.key)) {
      const n = parseInt(e.key, 10) - 1;
      if (n >= 0 && n < PRODUCTS.length) next = n;
    }
    if (next === null) return;
    e.preventDefault();
    pauseAutoScroll();
    scheduleResume();
    setActiveIdx(next);
    scrollStripFrameIntoView(el, "data-appframe", next, {
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
    window.setTimeout(() => syncActive(el), 320);
  };

  const jumpToCard = (next: number) => {
    const el = stripRef.current;
    if (!el || next < 0 || next >= PRODUCTS.length) return;
    pauseAutoScroll();
    scheduleResume();
    setActiveIdx(next);
    scrollStripFrameIntoView(el, "data-appframe", next, {
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
    window.setTimeout(() => syncActive(el), 320);
  };

  if (PRODUCTS.length === 0) return null;

  const appsStripHintId = "masthead-apps-marquee-hint";

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-sunken)",
      }}
    >
      <div className="product-marquee-grid">
        <div
          className="product-marquee-sidebar"
          style={{
            borderRight: "1px solid var(--border-subtle)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              className="marquee-sidebar-kicker"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-tertiary)",
              }}
            >
              Ship
            </span>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 28,
                letterSpacing: "-0.02em",
                marginTop: 6,
              }}
            >
              Apps
            </div>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                lineHeight: 1.45,
                color: "var(--fg-secondary)",
                maxWidth: 200,
              }}
            >
              Live tools and sites from the studio.
            </p>
            <p
              className="marquee-sidebar-meta-line"
              style={{
                margin: "6px 0 0",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--fg-secondary)",
              }}
            >
              {PRODUCTS.length} products
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                lineHeight: 1.35,
                color: "var(--fg-tertiary)",
              }}
            >
              {reduceMotion
                ? "Reduced motion: scroll manually."
                : "Auto-scroll pauses while you drag or use the wheel."}
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--fg-secondary)",
              }}
            >
              Frame{" "}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {String(activeIdx + 1).padStart(2, "0")} /{" "}
                {String(PRODUCTS.length).padStart(2, "0")}
              </span>
            </p>
            <div
              role="group"
              aria-label="Jump to product by index"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginTop: 10,
              }}
            >
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => jumpToCard(i)}
                  style={{
                    minWidth: 26,
                    minHeight: 28,
                    padding: "0 6px",
                    borderRadius: 4,
                    border:
                      i === activeIdx
                        ? "1px solid var(--accent)"
                        : "1px solid var(--border-subtle)",
                    background:
                      i === activeIdx ? "var(--accent-soft)" : "transparent",
                    color: "var(--fg-secondary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                  aria-label={`Show ${p.name} in strip`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p
              id={appsStripHintId}
              style={{
                margin: "10px 0 0",
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                lineHeight: 1.45,
                color: "var(--fg-tertiary)",
              }}
            >
              {MARQUEE_INTERACTION_HINT}
            </p>
          </div>
        </div>

        <div
          ref={stripRef}
          className="product-marquee-scroll"
          role="region"
          aria-label={
            reduceMotion
              ? "Shipping apps — use arrow keys or drag to scroll"
              : "Shipping apps — auto-scrolling; drag or wheel to pause"
          }
          aria-describedby={appsStripHintId}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onWheel={onWheel}
          onScroll={onScrollStrip}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            cursor: "grab",
            userSelect: "none",
            touchAction: "pan-x",
            WebkitMaskImage:
              "linear-gradient(to right, #000 0, #000 calc(100% - 40px), transparent 100%)",
            maskImage:
              "linear-gradient(to right, #000 0, #000 calc(100% - 40px), transparent 100%)",
          }}
        >
          <div
            ref={innerRef}
            className="product-marquee-inner"
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: "280px",
              height: "100%",
              paddingRight: 48,
            }}
          >
            {[0, 1].map((dup) =>
              PRODUCTS.map((p, i) => (
                <ProductMarqueeCard
                  key={`${p.slug}-${dup}`}
                  p={p}
                  frameIndex={i}
                  active={i === activeIdx}
                  onHover={() => {
                    if (!isPointerDragActive()) setActiveIdx(i);
                  }}
                  suppressClickIfDragged={suppressClickIfDragged}
                />
              )),
            )}
          </div>
        </div>
      </div>

      <style>{`
        .product-marquee-grid {
          display: grid;
          grid-template-columns: 140px 1fr;
          min-height: 220px;
        }
        @media (max-width: 640px) {
          .product-marquee-grid {
            grid-template-columns: 1fr;
            min-height: 200px;
          }
          .product-marquee-sidebar {
            border-right: 0 !important;
            border-bottom: 1px solid var(--border-subtle);
            padding: 14px 20px !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-end;
            gap: 16px;
          }
          .product-marquee-sidebar > div:first-child {
            display: flex;
            align-items: baseline;
            gap: 10px;
          }
          .product-marquee-sidebar > div:first-child > div:nth-child(2) {
            font-size: 20px !important;
          }
          .product-marquee-sidebar .marquee-sidebar-meta-line {
            display: none !important;
          }
        }

        .product-marquee-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .product-marquee-scroll::-webkit-scrollbar { display: none; }

        .product-marquee-scroll[data-dragging="true"] { cursor: grabbing; }
        .product-marquee-scroll[data-dragging="true"] a { cursor: grabbing; }

        @media (max-width: 900px) {
          .product-marquee-inner {
            grid-auto-columns: min(260px, 78vw) !important;
          }
        }
        @media (max-width: 480px) {
          .product-marquee-inner {
            grid-auto-columns: min(240px, 85vw) !important;
          }
        }
      `}</style>
    </div>
  );
}

function ProductMarqueeCard({
  p,
  active,
  onHover,
  suppressClickIfDragged,
  frameIndex,
}: {
  p: Product;
  active: boolean;
  onHover: () => void;
  suppressClickIfDragged: () => boolean;
  /** Catalog index (same on both duplicated rows) for scroll sync. */
  frameIndex: number;
}) {
  return (
    <Link
      href={`/products/${p.slug}`}
      aria-label={`${p.name}: ${p.tagline}`}
      data-appframe={frameIndex}
      onMouseEnter={onHover}
      onFocus={onHover}
      draggable={false}
      onClick={(e) => {
        if (suppressClickIfDragged()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragStart={(e) => e.preventDefault()}
      style={{
        borderRight: "1px solid var(--border-subtle)",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: active ? "var(--bg-elevated)" : "transparent",
        transition: "background var(--dur-base) var(--ease-standard)",
        color: "inherit",
        userSelect: "none",
        WebkitUserDrag: "none",
      } as CSSProperties}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Mono style={{ color: "var(--fg-tertiary)" }}>{p.n}</Mono>
        <Mono style={{ color: "var(--fg-tertiary)" }}>{p.year}</Mono>
      </div>
      <BrowserFrame product={p} variant="card" decorative aspect="16 / 10" />
      <div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: "-0.02em",
          }}
        >
          {p.name}
        </div>
        <p
          style={{
            margin: "3px 0 0",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            lineHeight: 1.4,
            color: "var(--fg-secondary)",
          }}
        >
          {p.tagline}
        </p>
      </div>
    </Link>
  );
}
