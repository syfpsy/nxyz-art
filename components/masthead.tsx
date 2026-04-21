"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PEOPLE } from "@/content/people";
import { WORKS, type Work } from "@/content/works";
import { WorkAttributionStack } from "./work-attribution";
import { Mono } from "./mono";
import { FrameGlyph, frameBackground } from "./frame-glyph";
import { HlsVideo } from "./hls-video";

/**
 * Unusual hero: no headline. Giant wordmark at the top like a title page,
 * a dateline strip above it, then a horizontal filmstrip of works below.
 * Reads like a colophon or gallery nameplate.
 */
function StudioByline() {
  const lines = useMemo(
    () => PEOPLE.map((p) => p.tagline).filter((t) => t.trim().length > 0),
    [],
  );
  const [i, setI] = useState(0);
  useEffect(() => {
    if (lines.length <= 1) return;
    const t = window.setInterval(
      () => setI((n) => (n + 1) % lines.length),
      9000,
    );
    return () => window.clearInterval(t);
  }, [lines.length]);
  if (lines.length === 0) return null;
  return (
    <div
      style={{
        paddingTop: 10,
        paddingBottom: 12,
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <Mono
        style={{
          fontSize: 12,
          color: "var(--fg-secondary)",
          display: "block",
          lineHeight: 1.55,
          maxWidth: 720,
        }}
      >
        {lines[i]}
      </Mono>
    </div>
  );
}

function MastheadInner() {
  const searchParams = useSearchParams();
  const initialFrameSlug = searchParams.get("frame");
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
  const active =
    WORKS.length > 0 ? (WORKS[activeIdx] ?? WORKS[0]) : undefined;

  return (
    <section
      aria-label="Masthead"
      style={{ borderBottom: "1px solid var(--border-subtle)", position: "relative" }}
    >
      <div
        style={{
          padding: "clamp(24px, 5vw, 36px) clamp(16px, 4vw, 24px) 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dateline strip */}
        <div
          className="masthead-dateline"
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "clamp(12px, 3vw, 24px)",
            borderBottom: "1px solid var(--fg-primary)",
            paddingBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <Mono>PRESS · RELEASE · {year}</Mono>
          <Mono>VOL · {counter.toString().padStart(5, "0")}</Mono>
          <Mono>FOLIO · A–H</Mono>
        </div>

        <StudioByline />

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
            {active ? (
              <>
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
              </>
            ) : (
              <Mono style={{ color: "var(--fg-tertiary)" }}>NO WORKS ON FILE</Mono>
            )}
          </div>
        </div>
      </div>

      {/* Timeline filmstrip */}
      {WORKS.length > 0 && (
        <Filmstrip
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          initialFrameSlug={initialFrameSlug}
        />
      )}

      <style>{`
        @media (max-width: 520px) {
          .masthead-dateline > :nth-child(3) { display: none; }
        }
        @media (max-width: 720px) {
          .masthead-colophon {
            grid-template-columns: 1fr !important;
            gap: clamp(16px, 4vw, 24px) !important;
          }
          .masthead-colophon > div:last-child { text-align: left !important; }
        }
        @keyframes filmstripCreatorPop {
          from {
            opacity: 0.55;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .filmstrip-creator-handoff {
          display: inline-block;
          animation: filmstripCreatorPop 0.38s var(--ease-standard, ease-out);
        }
      `}</style>
    </section>
  );
}

export function Masthead() {
  return (
    <Suspense
      fallback={
        <section
          aria-busy="true"
          aria-label="Loading masthead"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            minHeight: 400,
            background: "var(--bg-base)",
          }}
        />
      }
    >
      <MastheadInner />
    </Suspense>
  );
}

/** Slow horizontal crawl (px/s) — lower-thirds / news-ticker feel. */
const FILMSTRIP_AUTO_SCROLL_PX = 13;
/** Max concurrent HLS streams in the strip (closest to center). */
const FILMSTRIP_MAX_PLAYING = 4;

function setsEqual(a: Set<number>, b: Set<number>) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

function Filmstrip({
  activeIdx,
  setActiveIdx,
  initialFrameSlug,
}: {
  activeIdx: number;
  setActiveIdx: Dispatch<SetStateAction<number>>;
  initialFrameSlug: string | null;
}) {
  const urlAppliedRef = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const autoPausedRef = useRef(false);
  const rafRef = useRef(0);
  const scrollSyncRaf = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotionRef = useRef(false);
  // Drag state lives in a ref so handlers stay stable and don't rerender.
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: 0,
    pointerId: 0,
  });
  const [playingIndices, setPlayingIndices] = useState<Set<number>>(
    () => new Set(),
  );
  /** Which duplicated row (0 or 1) should own video decode — avoids twin HLS for the same slug. */
  const [videoDup, setVideoDup] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const v = mq.matches;
      reduceMotionRef.current = v;
      setReduceMotion(v);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const pauseAutoScroll = useCallback(() => {
    autoPausedRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      autoPausedRef.current = false;
      resumeTimerRef.current = null;
    }, 2800);
  }, []);

  const syncActiveAndPlaying = useCallback(
    (strip: HTMLElement) => {
      const sr = strip.getBoundingClientRect();
      if (sr.width < 8) return;
      const center = sr.left + sr.width / 2;
      const byIndex = new Map<number, number>();
      strip.querySelectorAll<HTMLElement>("a[data-filmframe]").forEach((node) => {
        const r = node.getBoundingClientRect();
        if (r.width < 4) return;
        const overlaps = r.right > sr.left && r.left < sr.right;
        if (!overlaps) return;
        const mid = (r.left + r.right) / 2;
        const dist = Math.abs(mid - center);
        const idx = Number(node.dataset.filmframe);
        if (!Number.isFinite(idx)) return;
        const prev = byIndex.get(idx);
        if (prev === undefined || dist < prev) byIndex.set(idx, dist);
      });
      const sorted = [...byIndex.entries()].sort((a, b) => a[1] - b[1]);
      const nextActive = sorted[0]?.[0] ?? 0;
      setActiveIdx((prev) => (prev === nextActive ? prev : nextActive));

      const nextPlaying = new Set<number>();
      for (const [idx] of sorted) {
        if (WORKS[idx]?.video && nextPlaying.size < FILMSTRIP_MAX_PLAYING) {
          nextPlaying.add(idx);
        }
      }
      setPlayingIndices((prev) =>
        setsEqual(prev, nextPlaying) ? prev : nextPlaying,
      );
    },
    [setActiveIdx],
  );

  // Continuous slow scroll + seamless loop (duplicate row), ticker-style.
  // useLayoutEffect so refs are attached before we read scrollWidth / start rAF.
  useLayoutEffect(() => {
    if (reduceMotion) return;
    const strip = stripRef.current;
    const inner = innerRef.current;
    if (!strip || !inner) return;

    let cancelled = false;
    let last = performance.now();
    let n = 0;

    const tick = (now: number) => {
      if (cancelled) return;
      const dt = Math.min(40, now - last);
      last = now;
      const el = stripRef.current;
      const inn = innerRef.current;
      if (el && inn) {
        const loopW = inn.scrollWidth / 2;
        const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
        if (loopW > 2) {
          const half = el.scrollLeft >= loopW - 0.5 ? 1 : 0;
          setVideoDup((d) => (d === half ? d : half));
        }
        if (
          loopW > 2 &&
          maxScroll > 0 &&
          !autoPausedRef.current &&
          !reduceMotionRef.current
        ) {
          let next = el.scrollLeft + (FILMSTRIP_AUTO_SCROLL_PX * dt) / 1000;
          // Seamless loop: second half of the inner row duplicates the first.
          while (next >= loopW) next -= loopW;
          el.scrollLeft = Math.max(0, next);
        }
        n++;
        if (n % 5 === 0) syncActiveAndPlaying(el);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduceMotion, syncActiveAndPlaying]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = stripRef.current;
      if (el) syncActiveAndPlaying(el);
    });
    return () => cancelAnimationFrame(id);
  }, [syncActiveAndPlaying]);

  useLayoutEffect(() => {
    if (urlAppliedRef.current || !initialFrameSlug) return;
    const idx = WORKS.findIndex((w) => w.slug === initialFrameSlug);
    if (idx < 0) return;
    urlAppliedRef.current = true;
    setActiveIdx(idx);
    const run = () => {
      const strip = stripRef.current;
      strip
        ?.querySelector<HTMLElement>(`[data-filmframe="${idx}"]`)
        ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [initialFrameSlug, setActiveIdx]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      cancelAnimationFrame(scrollSyncRaf.current);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pauseAutoScroll();
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
    syncActiveAndPlaying(el);
    scheduleResume();
  };

  const onScrollStrip = () => {
    const el = stripRef.current;
    const inn = innerRef.current;
    if (!el) return;
    // Auto-scroll path already syncs in the rAF loop; only hook scroll when
    // the user is driving (reduced motion, paused, or manual wheel/drag).
    if (!reduceMotionRef.current && !autoPausedRef.current) return;
    if (inn) {
      const loopW = inn.scrollWidth / 2;
      if (loopW > 2) {
        const half = el.scrollLeft >= loopW - 0.5 ? 1 : 0;
        setVideoDup((d) => (d === half ? d : half));
      }
    }
    cancelAnimationFrame(scrollSyncRaf.current);
    scrollSyncRaf.current = requestAnimationFrame(() => syncActiveAndPlaying(el));
  };

  // Convert vertical wheel deltas into horizontal scroll within the strip,
  // but only when the strip can actually still scroll in that direction —
  // otherwise fall through so the page can keep scrolling naturally.
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : 0;
    if (delta === 0) return;
    pauseAutoScroll();
    scheduleResume();
    const max = el.scrollWidth - el.clientWidth;
    const atStart = el.scrollLeft <= 0 && delta < 0;
    const atEnd = el.scrollLeft >= max && delta > 0;
    if (atStart || atEnd) return;
    el.scrollLeft += delta;
    e.preventDefault();
    syncActiveAndPlaying(el);
  };

  const suppressClickIfDragged = () => dragRef.current.moved > 5;

  // Arrow-key navigation keeps the strip fully reachable by keyboard. The
  // hint in the sidebar ("DRAG OR ↔ TO SCAN") now actually delivers on that
  // promise — Left/Right step the active frame and scroll it into view,
  // Home/End jump to the ends.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    let next: number | null = null;
    if (e.key === "ArrowRight") {
      next = Math.min(WORKS.length - 1, activeIdx + 1);
    } else if (e.key === "ArrowLeft") {
      next = Math.max(0, activeIdx - 1);
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = WORKS.length - 1;
    } else if (/^[1-9]$/.test(e.key)) {
      const n = parseInt(e.key, 10) - 1;
      if (n >= 0 && n < WORKS.length) next = n;
    }
    if (next === null) return;
    e.preventDefault();
    pauseAutoScroll();
    scheduleResume();
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
    window.setTimeout(() => syncActiveAndPlaying(el), 320);
  };

  const jumpToFrame = (next: number) => {
    const el = stripRef.current;
    if (!el || next < 0 || next >= WORKS.length) return;
    pauseAutoScroll();
    scheduleResume();
    setActiveIdx(next);
    el.querySelector<HTMLElement>(`[data-filmframe="${next}"]`)?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
    window.setTimeout(() => syncActiveAndPlaying(el), 320);
  };

  return (
    <div
      style={{
        marginTop: 36,
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
      }}
    >
      <div className="filmstrip-grid">
        <div
          className="filmstrip-sidebar"
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
            <Mono style={{ color: "var(--fg-tertiary)" }}>
              {reduceMotion ? "↔ TO SCAN" : "AUTO · DRAG OR ↔ TO PAUSE"}
            </Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>
              FRAME {String(activeIdx + 1).padStart(2, "0")} /{" "}
              {String(WORKS.length).padStart(2, "0")}
            </Mono>
            <div
              role="group"
              aria-label="Jump to work by index"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginTop: 10,
              }}
            >
              {WORKS.map((w, i) => (
                <button
                  key={w.slug}
                  type="button"
                  onClick={() => jumpToFrame(i)}
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
                  aria-label={`Open ${w.title} in timeline`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Mono
              style={{
                color: "var(--fg-tertiary)",
                fontSize: 9,
                marginTop: 8,
                lineHeight: 1.35,
              }}
            >
              Keys 1–{Math.min(9, WORKS.length)} · add ?frame=work-slug to URL
            </Mono>
          </div>
        </div>

        <div
          ref={stripRef}
          className="filmstrip-scroll"
          role="region"
          aria-label={
            reduceMotion
              ? "Timeline filmstrip — use arrow keys or drag to scroll"
              : "Timeline filmstrip — auto-scrolling; drag or wheel to pause"
          }
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
              "linear-gradient(to right, #000 0, #000 calc(100% - 48px), transparent 100%)",
            maskImage:
              "linear-gradient(to right, #000 0, #000 calc(100% - 48px), transparent 100%)",
          }}
        >
          <div
            ref={innerRef}
            className="filmstrip-inner"
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: "300px",
              height: "100%",
              paddingRight: 60,
            }}
          >
            {[0, 1].map((dup) =>
              WORKS.map((w, i) => (
                <FilmFrame
                  key={`${w.slug}-${dup}`}
                  w={w}
                  index={i}
                  active={i === activeIdx}
                  playVideo={playingIndices.has(i) && dup === videoDup}
                  onHover={() => {
                    if (!dragRef.current.active) setActiveIdx(i);
                  }}
                  suppressClickIfDragged={suppressClickIfDragged}
                />
              )),
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Desktop: fixed 140px sidebar (index title + frame counter) next to
           the scrollable strip. Mobile: sidebar stacks on top with minimum
           chrome so the strip gets the full viewport width. */
        .filmstrip-grid {
          display: grid;
          grid-template-columns: 140px 1fr;
          min-height: 280px;
        }
        @media (max-width: 640px) {
          .filmstrip-grid {
            grid-template-columns: 1fr;
            min-height: 240px;
          }
          .filmstrip-sidebar {
            border-right: 0 !important;
            border-bottom: 1px solid var(--border-subtle);
            padding: 14px 20px !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-end;
            gap: 16px;
          }
          .filmstrip-sidebar > div:first-child {
            display: flex;
            align-items: baseline;
            gap: 10px;
          }
          .filmstrip-sidebar > div:first-child > div:nth-child(2) {
            font-size: 20px !important;
          }
          .filmstrip-sidebar > div:first-child > span:last-child {
            display: none;
          }
        }

        /* Hide the native scrollbar while keeping the element scrollable. */
        .filmstrip-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .filmstrip-scroll::-webkit-scrollbar { display: none; }

        .filmstrip-scroll[data-dragging="true"] { cursor: grabbing; }
        .filmstrip-scroll[data-dragging="true"] a { cursor: grabbing; }

        /* Film frames: slightly narrower on small screens so one column
           + sidebar doesn’t feel pinched; still scrolls horizontally. */
        @media (max-width: 900px) {
          .filmstrip-inner {
            grid-auto-columns: min(280px, 78vw) !important;
          }
        }
        @media (max-width: 480px) {
          .filmstrip-inner {
            grid-auto-columns: min(260px, 85vw) !important;
          }
        }
      `}</style>
    </div>
  );
}

function FilmFrame({
  w,
  index,
  active,
  playVideo,
  onHover,
  suppressClickIfDragged,
}: {
  w: Work;
  index: number;
  active: boolean;
  /** Muted preview — up to FILMSTRIP_MAX_PLAYING tiles nearest strip center. */
  playVideo: boolean;
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
            playing={playVideo}
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
        {w.personSlugs?.length ? (
          <span
            key={`${w.slug}-cred-${active ? "1" : "0"}`}
            className={active ? "filmstrip-creator-handoff" : undefined}
            style={{ display: "inline-block" }}
          >
            <WorkAttributionStack work={w} size={26} position="top-right" />
          </span>
        ) : null}
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
