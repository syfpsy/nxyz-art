"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/content/products";

type BrowserFrameProps = {
  product: Product;
  /** Embed variant:
   *  - "card":     non-interactive preview for a grid card (pointer-events: none)
   *  - "detail":   fully interactive preview on a detail page
   */
  variant?: "card" | "detail";
  /** Aspect ratio for the frame body, e.g. "16 / 10". Defaults per variant. */
  aspect?: string;
  /** Target viewport width the iframe should render at before scaling. */
  viewportWidth?: number;
};

/**
 * A minimal browser chrome wrapping a live site.
 * - The chrome is always visible, so if the iframe is blocked by X-Frame-Options
 *   or CSP frame-ancestors, the empty body is handled by a styled fallback.
 * - "card" variant is decorative (pointer-events: none); the parent link is clickable.
 * - "detail" variant is interactive and sized to feel like a real viewport.
 */
export function BrowserFrame({
  product,
  variant = "card",
  aspect = variant === "card" ? "16 / 9" : "16 / 10",
  // Cards render at a wide "overview" viewport and scale down hard, so the
  // embedded site appears roughly half size — more content, denser cards.
  viewportWidth = variant === "card" ? 2560 : 1440,
}: BrowserFrameProps) {
  const blocked = product.embedBlocked ?? false;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Recompute the scale so `viewportWidth` fits the card body.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      setScale(w > 0 ? w / viewportWidth : 1);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewportWidth]);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-elevated)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      {/* Chrome */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "var(--bg-sunken)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--border-strong)",
                display: "inline-block",
                opacity: 0.7,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.02em",
            color: "var(--fg-secondary)",
            padding: "4px 10px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: product.accent,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            https://{product.domain}
          </span>
        </div>
        <span
          className="t-label"
          style={{
            color:
              product.status === "live"
                ? "var(--status-live)"
                : "var(--fg-tertiary)",
            whiteSpace: "nowrap",
          }}
        >
          {product.status === "live" ? "● LIVE" : "● BETA"}
        </span>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        style={{
          position: "relative",
          aspectRatio: aspect,
          overflow: "hidden",
          background: "var(--bg-elevated)",
        }}
      >
        {!blocked && (
          <iframe
            src={product.url}
            title={`${product.name} live preview`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            style={{
              width: viewportWidth,
              height: viewportWidth * aspectRatioToHeightMultiplier(aspect),
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              pointerEvents: variant === "card" ? "none" : "auto",
              display: "block",
              background: "var(--bg-elevated)",
              maxWidth: "none",
            }}
          />
        )}

        {blocked && <BlockedFallback product={product} variant={variant} />}

        {variant === "card" && !blocked && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 0%, transparent 55%, rgba(17,18,20,0.14) 100%)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

function BlockedFallback({
  product,
  variant,
}: {
  product: Product;
  variant: "card" | "detail";
}) {
  const accentTint = hexWithAlpha(product.accent, 0.12);
  const accentRing = hexWithAlpha(product.accent, 0.22);
  const accentGhost = hexWithAlpha(product.accent, 0.06);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateRows: "1fr auto",
        background: `
          radial-gradient(90% 60% at 70% 20%, ${accentTint} 0%, transparent 60%),
          radial-gradient(80% 50% at 20% 80%, ${accentGhost} 0%, transparent 55%),
          linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-sunken) 100%)
        `,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.25,
          maskImage:
            "radial-gradient(70% 70% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(70% 70% at 50% 40%, black 30%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 14,
          padding: variant === "card" ? "clamp(20px, 4vw, 40px)" : 56,
          maxWidth: 520,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 10px 6px 8px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 999,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--fg-secondary)",
            textTransform: "uppercase",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: product.accent,
              boxShadow: `0 0 0 4px ${accentRing}`,
            }}
          />
          Preview protected · open to try
        </div>

        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: variant === "card" ? "clamp(24px, 3vw, 34px)" : 44,
            letterSpacing: "-0.028em",
            lineHeight: 1.05,
            color: "var(--fg-primary)",
          }}
        >
          {product.name}
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: variant === "card" ? "clamp(14px, 1.4vw, 17px)" : 20,
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            color: "var(--fg-secondary)",
            maxWidth: 420,
            textWrap: "pretty",
          }}
        >
          {product.tagline}
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 4,
          }}
        >
          {product.disciplines.slice(0, 3).map((d) => (
            <span
              key={d}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "4px 8px",
                border: "1px solid var(--border-subtle)",
                borderRadius: 4,
                background: "var(--bg-elevated)",
                color: "var(--fg-secondary)",
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: variant === "card" ? "0 clamp(20px, 4vw, 40px) clamp(20px, 4vw, 40px)" : "0 56px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.02em",
            color: "var(--fg-tertiary)",
          }}
        >
          {product.domain}
        </span>
        {variant === "detail" && (
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 8,
              background: "var(--fg-primary)",
              color: "var(--bg-base)",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Open {product.domain} ↗
          </a>
        )}
      </div>
    </div>
  );
}

/** Parse an `"A / B"` aspect ratio into a (height / width) multiplier. */
function aspectRatioToHeightMultiplier(aspect: string): number {
  const [a, b] = aspect.split("/").map((s) => parseFloat(s.trim()));
  if (!a || !b) return 0.5625; // 16:9 fallback
  return b / a;
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
