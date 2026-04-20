"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WORKS, type Work } from "@/content/works";
import { Mono } from "./mono";
import { FrameGlyph, frameBackground } from "./frame-glyph";

/**
 * Unusual hero: no headline. Giant wordmark at the top like a title page,
 * a dateline strip above it, then a horizontal filmstrip of works below.
 * Reads like a colophon or gallery nameplate.
 */
export function Masthead() {
  const [counter, setCounter] = useState(2481);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setCounter((c) => c + Math.floor(Math.random() * 3)),
      1100,
    );
    return () => clearInterval(t);
  }, []);

  const year = new Date().getFullYear();
  const active = WORKS[activeIdx];

  return (
    <section
      aria-label="Masthead"
      style={{ borderBottom: "1px solid var(--border-subtle)", position: "relative" }}
    >
      <div style={{ padding: "36px 24px 0", position: "relative", overflow: "hidden" }}>
        {/* Dateline strip */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 24,
            borderBottom: "1px solid var(--fg-primary)",
            paddingBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <Mono>PRESS · RELEASE · {year}</Mono>
          <Mono>VOL · {counter.toString().padStart(5, "0")}</Mono>
          <Mono>FOLIO · A–H</Mono>
        </div>

        {/* Oversized typographic wordmark */}
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "clamp(96px, 20vw, 300px)",
            lineHeight: 1,
            letterSpacing: "-0.06em",
            color: "var(--fg-primary)",
            display: "flex",
            alignItems: "flex-end",
            gap: "0.05em",
            marginTop: 18,
            paddingBottom: "0.08em",
          }}
        >
          <span>nxyz</span>
          <span
            aria-hidden
            style={{
              width: "0.12em",
              height: "0.12em",
              borderRadius: "50%",
              background: "var(--accent)",
              marginLeft: "0.14em",
              marginBottom: "0.1em",
              flexShrink: 0,
            }}
          />
        </div>

        {/* Colophon row — three-column editorial lockup */}
        <div
          className="masthead-colophon"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1.8fr 1fr",
            gap: 24,
            paddingTop: 20,
            marginTop: 20,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <Mono style={{ color: "var(--fg-secondary)" }}>
            — a studio for motion, systems, and signal.
          </Mono>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "clamp(16px, 1.4vw, 20px)",
              lineHeight: 1.45,
              color: "var(--fg-primary)",
              textWrap: "pretty",
              maxWidth: 640,
            }}
          >
            Eight works on file. Four on rotation. Two in progress. One studio in Berlin,
            working across time zones by way of slow correspondence.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              textAlign: "right",
            }}
          >
            <Mono style={{ color: "var(--fg-tertiary)" }}>NOW PLAYING</Mono>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 15,
                letterSpacing: "-0.01em",
              }}
            >
              {active.title} / {active.kind.toLowerCase()}
            </span>
            <Mono style={{ color: "var(--accent)" }}>
              → fr. {active.dur ?? "static · n/a"}
            </Mono>
          </div>
        </div>
      </div>

      {/* Timeline filmstrip */}
      <Filmstrip activeIdx={activeIdx} setActiveIdx={setActiveIdx} />

      <style>{`
        @media (max-width: 720px) {
          .masthead-colophon {
            grid-template-columns: 1fr !important;
          }
          .masthead-colophon > div:last-child { text-align: left !important; }
        }
      `}</style>
    </section>
  );
}

function Filmstrip({
  activeIdx,
  setActiveIdx,
}: {
  activeIdx: number;
  setActiveIdx: (i: number) => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        marginTop: 36,
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", minHeight: 280 }}>
        <div
          style={{
            borderRight: "1px solid var(--border-subtle)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Mono style={{ color: "var(--fg-tertiary)" }}>INDEX</Mono>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 28,
                letterSpacing: "-0.02em",
                marginTop: 6,
              }}
            >
              Timeline
            </div>
            <Mono
              style={{
                color: "var(--fg-secondary)",
                marginTop: 6,
                display: "block",
              }}
            >
              {WORKS.length} works · {WORKS[WORKS.length - 1].year} – {WORKS[0].year}
            </Mono>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Mono style={{ color: "var(--fg-tertiary)" }}>DRAG OR ↔ TO SCAN</Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>
              FRAME {String(activeIdx + 1).padStart(2, "0")} /{" "}
              {String(WORKS.length).padStart(2, "0")}
            </Mono>
          </div>
        </div>

        <div
          ref={stripRef}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            WebkitMaskImage:
              "linear-gradient(to right, #000 0, #000 calc(100% - 48px), transparent 100%)",
            maskImage:
              "linear-gradient(to right, #000 0, #000 calc(100% - 48px), transparent 100%)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: "300px",
              height: "100%",
              paddingRight: 60,
            }}
          >
            {WORKS.map((w, i) => (
              <FilmFrame
                key={w.slug}
                w={w}
                active={i === activeIdx}
                onHover={() => setActiveIdx(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilmFrame({
  w,
  active,
  onHover,
}: {
  w: Work;
  active: boolean;
  onHover: () => void;
}) {
  const fg = w.tone === "dark" ? "#F3F5F7" : "#111214";
  return (
    <Link
      href={`/work/${w.slug}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      style={{
        borderRight: "1px solid var(--border-subtle)",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: active ? "var(--bg-elevated)" : "transparent",
        transition: "background var(--dur-base) var(--ease-standard)",
        cursor: "pointer",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Mono style={{ color: "var(--fg-tertiary)" }}>{w.n}</Mono>
        <Mono style={{ color: w.accent ? "var(--accent)" : "var(--fg-tertiary)" }}>
          {w.year}
        </Mono>
      </div>
      <div
        style={{
          flex: 1,
          borderRadius: 4,
          background: frameBackground(w.tone),
          position: "relative",
          overflow: "hidden",
        }}
      >
        <FrameGlyph work={w} />
        {w.dur && (
          <div
            style={{
              position: "absolute",
              left: 8,
              bottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 0,
                height: 0,
                borderLeft: `5px solid ${fg}`,
                borderTop: "3px solid transparent",
                borderBottom: "3px solid transparent",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: fg,
                fontSize: 9,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {w.dur}
            </span>
          </div>
        )}
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 19,
            letterSpacing: "-0.02em",
          }}
        >
          {w.title}
          {w.accent && <span style={{ color: "var(--accent)" }}>.</span>}
        </div>
        <Mono
          style={{ color: "var(--fg-secondary)", marginTop: 4, display: "block" }}
        >
          {w.kind}
        </Mono>
      </div>
    </Link>
  );
}
