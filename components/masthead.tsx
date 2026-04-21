"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WORKS, type Work } from "@/content/works";
import { Mono } from "./mono";
import { FrameGlyph, frameBackground } from "./frame-glyph";
import { HlsVideo } from "./hls-video";

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
            Eight works on file. Four on rotation. Two in progress. One studio in İstanbul,
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
  // Drag state lives in a ref so handlers stay stable and don't rerender.
  // `moved` is the maximum pixel distance traveled — used to suppress the
  // child link's click if the pointer moved enough to count as a drag.
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: 0,
    pointerId: 0,
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
      pointerId: e.pointerId,
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
    el.setAttribute("data-dragging", "true");
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const el = stripRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    const d = dragRef.current;
    if (!el || !d.active) return;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}
    d.active = false;
    el.removeAttribute("data-dragging");
  };

  // Convert vertical wheel deltas into horizontal scroll within the strip,
  // but only when the strip can actually still scroll in that direction —
  // otherwise fall through so the page can keep scrolling naturally.
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : 0;
    if (delta === 0) return;
    const max = el.scrollWidth - el.clientWidth;
    const atStart = el.scrollLeft <= 0 && delta < 0;
    const atEnd = el.scrollLeft >= max && delta > 0;
    if (atStart || atEnd) return;
    el.scrollLeft += delta;
    e.preventDefault();
  };

  const suppressClickIfDragged = () => dragRef.current.moved > 5;

  // Arrow-key navigation keeps the strip fully reachable by keyboard. The
  // hint in the sidebar ("DRAG OR ↔ TO SCAN") now actually delivers on that
  // promise — Left/Right step the active frame and scroll it into view,
  // Home/End jump to the ends.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    let next = activeIdx;
    if (e.key === "ArrowRight") {
      next = Math.min(WORKS.length - 1, activeIdx + 1);
    } else if (e.key === "ArrowLeft") {
      next = Math.max(0, activeIdx - 1);
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = WORKS.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    setActiveIdx(next);
    const frame = el.querySelector<HTMLElement>(
      `[data-filmframe="${next}"]`,
    );
    if (frame) {
      frame.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
    }
  };

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
          className="filmstrip-scroll"
          role="region"
          aria-label="Timeline filmstrip — scroll or use arrow keys"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onWheel={onWheel}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            cursor: "grab",
            userSelect: "none",
            touchAction: "pan-x",
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
                index={i}
                active={i === activeIdx}
                onHover={() => {
                  if (!dragRef.current.active) setActiveIdx(i);
                }}
                suppressClickIfDragged={suppressClickIfDragged}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* Hide the native scrollbar while keeping the element scrollable. */
        .filmstrip-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .filmstrip-scroll::-webkit-scrollbar { display: none; }

        .filmstrip-scroll[data-dragging="true"] { cursor: grabbing; }
        .filmstrip-scroll[data-dragging="true"] a { cursor: grabbing; }
      `}</style>
    </div>
  );
}

function FilmFrame({
  w,
  index,
  active,
  onHover,
  suppressClickIfDragged,
}: {
  w: Work;
  index: number;
  active: boolean;
  onHover: () => void;
  suppressClickIfDragged: () => boolean;
}) {
  // Videos render on any imagery, so the badge needs the white treatment
  // the vignette is there to support. Static placeholders keep tone-matched.
  const fg = w.video ? "#F3F5F7" : w.tone === "dark" ? "#F3F5F7" : "#111214";
  return (
    <Link
      href={`/work/${w.slug}`}
      data-filmframe={index}
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
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: active ? "var(--bg-elevated)" : "transparent",
        transition: "background var(--dur-base) var(--ease-standard)",
        color: "inherit",
        userSelect: "none",
        WebkitUserDrag: "none",
      } as React.CSSProperties}
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
        {w.video ? (
          <HlsVideo
            src={w.video}
            playing={active}
            ariaLabel={`${w.title} — motion preview`}
          />
        ) : (
          <FrameGlyph work={w} />
        )}
        {/* Subtle vignette so the runtime badge stays legible over any footage. */}
        {w.video && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.35) 100%)",
              pointerEvents: "none",
            }}
          />
        )}
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
