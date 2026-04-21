"use client";

import { useEffect, useRef, useState } from "react";
import { STUDIO } from "@/content/studio";
import { Mono } from "./mono";

/**
 * Editorial studio-map plate.
 *
 * - Embeds OpenStreetMap via its public `/export/embed.html` URL (no API
 *   key needed).
 * - Deep-links to Google Maps, Apple Maps, and OSM for directions.
 * - In dark mode, a CSS filter inverts the map tiles so they read as a
 *   dark counterpart of the default mapnik style.
 */
type StudioMapProps = {
  /** Visual tone. "inverse" renders on the dark correspondence surface. */
  tone?: "default" | "inverse";
  /** Radius in degrees around the marker for the bounding box. */
  radius?: number;
};

export function StudioMap({ tone = "default", radius = 0.008 }: StudioMapProps) {
  const { lat, lng } = STUDIO;
  const bbox = [
    (lng - radius).toFixed(5),
    (lat - radius).toFixed(5),
    (lng + radius).toFixed(5),
    (lat + radius).toFixed(5),
  ].join(",");

  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const osmView = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    STUDIO.addressQuery,
  )}`;
  const amaps = `https://maps.apple.com/?q=${encodeURIComponent(
    STUDIO.addressQuery,
  )}&ll=${lat},${lng}`;

  const inverse = tone === "inverse";
  // On the inverse variant, every read-out sits on the always-dark
  // #0F1115 panel, so we draw from the on-inverse scale (non-flipping).
  // The default variant uses theme-adaptive tokens.
  const fg = inverse ? "var(--fg-on-inverse)" : "var(--fg-primary)";
  const fgSoft = inverse ? "var(--fg-on-inverse-tertiary)" : "var(--fg-tertiary)";
  const border = inverse
    ? "var(--border-on-inverse-subtle)"
    : "var(--border-subtle)";
  const panelBg = inverse ? "#0F1115" : "var(--bg-elevated)";

  return (
    <div
      className={`studio-map ${inverse ? "is-inverse" : ""}`}
      style={{
        border: `1px solid ${border}`,
        borderRadius: 6,
        overflow: "hidden",
        background: panelBg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Dateline */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "12px 16px",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <Mono style={{ color: fgSoft }}>
          PLOT · {lat.toFixed(4)} N · {lng.toFixed(4)} E
        </Mono>
        <Mono style={{ color: fgSoft }}>SRC · OPENSTREETMAP</Mono>
      </div>

      <MapTile
        embedSrc={osmEmbed}
        title={`Map of ${STUDIO.name}`}
        inverse={inverse}
      />

      {/* Caption + directions */}
      <div
        style={{
          padding: "14px 16px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 12,
          alignItems: "center",
          borderTop: `1px solid ${border}`,
        }}
        className="studio-map-caption"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STUDIO.address.map((line) => (
            <span
              key={line}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                letterSpacing: "-0.005em",
                color: fg,
              }}
            >
              {line}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <MapLink href={gmaps} tone={tone}>Google</MapLink>
          <MapLink href={amaps} tone={tone}>Apple</MapLink>
          <MapLink href={osmView} tone={tone}>OSM</MapLink>
        </div>
      </div>

      {/* Dark mode: re-tone the OSM mapnik tiles so they live comfortably on
          a dark surface without needing an API-keyed tile style. The filter
          only applies to the iframe; the brand pin stays true. */}
      <style>{`
        :root[data-theme="dark"] .studio-map iframe {
          filter: invert(0.92) hue-rotate(180deg) saturate(0.85) brightness(0.95);
        }
        @media (max-width: 520px) {
          .studio-map-caption {
            grid-template-columns: 1fr !important;
          }
          .studio-map-caption > *:last-child {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Defers mounting the OSM iframe until the tile enters the viewport. Until
 * then, we paint a static placeholder so the section has visual presence
 * without requesting third-party JS. Once intersection fires, we mount and
 * keep the iframe. Respects `prefers-reduced-data` — if set, we never
 * auto-mount and instead require an explicit click.
 */
function MapTile({
  embedSrc,
  title,
  inverse,
}: {
  embedSrc: string;
  title: string;
  inverse: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;

    const reducedData =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-data: reduce)").matches;
    if (reducedData) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMounted(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        aspectRatio: "16 / 10",
        background: inverse ? "#111214" : "#EEF0F3",
      }}
    >
      {mounted ? (
        <iframe
          title={title}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setMounted(true)}
          aria-label="Load interactive map"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: `radial-gradient(120% 90% at 50% 50%, ${
              inverse ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
            } 0%, transparent 70%)`,
            cursor: "pointer",
            border: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: inverse
              ? "var(--fg-on-inverse-secondary)"
              : "var(--fg-secondary)",
          }}
        >
          Load map ↗
        </button>
      )}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -100%)",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow:
            "0 0 0 4px rgba(93, 63, 211, 0.22), 0 1px 6px rgba(0,0,0,0.45)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function MapLink({
  href,
  tone,
  children,
}: {
  href: string;
  tone: "default" | "inverse";
  children: React.ReactNode;
}) {
  const inverse = tone === "inverse";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "6px 10px",
        borderRadius: 999,
        // Inverse pills live on the always-dark #0F1115 panel, so both
        // border and ink must read against that surface. The default-tone
        // variant stays on theme-adaptive tokens.
        border: `1px solid ${inverse ? "var(--border-on-inverse-strong)" : "var(--border-subtle)"}`,
        color: inverse ? "var(--fg-on-inverse)" : "var(--fg-primary)",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      ↗ {children}
    </a>
  );
}
