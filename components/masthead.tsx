"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WORKS, type Work } from "@/content/works";
import { WorkAttributionStack } from "./work-attribution";
import { Mono } from "./mono";
import { FrameGlyph, frameBackground } from "./frame-glyph";
import { HlsVideo } from "./hls-video";
import { useHorizontalMarqueeStrip } from "@/hooks/use-horizontal-marquee-strip";
import {
  MARQUEE_INTERACTION_HINT,
  MARQUEE_TIMELINE_URL_HINT,
} from "@/lib/marquee-sidebar-copy";
import {
  scrollStripFrameIntoView,
  sortedStripFrameIndices,
} from "@/lib/scroll-strip-frame";
import { ProductMarqueeStrip } from "./product-marquee-strip";

/**
 * Home masthead: rolling strip of shipped apps, then the work timeline filmstrip.
 */

function MastheadInner() {
  const searchParams = useSearchParams();
  const initialFrameSlug = searchParams.get("frame");
  const [activeIdx, setActiveIdx] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section
      aria-label="Masthead"
      style={{ borderBottom: "1px solid var(--border-subtle)", position: "relative" }}
    >
      <ProductMarqueeStrip reduceMotion={reduceMotion} />

      {WORKS.length > 0 && (
        <Filmstrip
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          initialFrameSlug={initialFrameSlug}
          reduceMotion={reduceMotion}
        />
      )}

      <MastheadFoot />

      <style>{`
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

/** Primary paths off the fold — motion work first, then shipped software. */
function MastheadFoot() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-elevated)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "14px clamp(16px, 4vw, 24px)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px 20px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            lineHeight: 1.45,
            color: "var(--fg-secondary)",
            maxWidth: 420,
          }}
        >
          Start with selected motion work, or jump to the full software grid.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
          <Link
            href="/work"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--accent-deep)",
              textDecoration: "underline",
              textUnderlineOffset: 4,
              textDecorationThickness: 1,
            }}
          >
            Selected work
          </Link>
          <Link
            href="/#software"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: 14,
              color: "var(--fg-secondary)",
            }}
          >
            All software
          </Link>
        </div>
      </div>
    </div>
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
            minHeight: 280,
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
  reduceMotion: reduceMotionProp,
}: {
  activeIdx: number;
  setActiveIdx: Dispatch<SetStateAction<number>>;
  initialFrameSlug: string | null;
  reduceMotion: boolean;
}) {
  const urlAppliedRef = useRef(false);
  const [playingIndices, setPlayingIndices] = useState<Set<number>>(
    () => new Set(),
  );
  /** Which duplicated row (0 or 1) should own video decode — avoids twin HLS for the same slug. */
  const [videoDup, setVideoDup] = useState(0);

  const maintainDupHalf = useCallback((strip: HTMLDivElement, inner: HTMLDivElement) => {
    const loopW = inner.scrollWidth / 2;
    if (loopW > 2) {
      const half = strip.scrollLeft >= loopW - 0.5 ? 1 : 0;
      setVideoDup((d) => (d === half ? d : half));
    }
  }, []);

  const syncActiveAndPlaying = useCallback(
    (strip: HTMLElement) => {
      const sorted = sortedStripFrameIndices(strip, "data-filmframe");
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
    reduceMotion: reduceMotionProp,
    autoScrollPxPerSecond: FILMSTRIP_AUTO_SCROLL_PX,
    syncFromStrip: syncActiveAndPlaying,
    maintainDupHalf,
  });

  useLayoutEffect(() => {
    if (urlAppliedRef.current || !initialFrameSlug) return;
    const idx = WORKS.findIndex((w) => w.slug === initialFrameSlug);
    if (idx < 0) return;
    urlAppliedRef.current = true;
    setActiveIdx(idx);
    const run = () => {
      const strip = stripRef.current;
      if (!strip) return;
      scrollStripFrameIntoView(strip, "data-filmframe", idx, {
        inline: "center",
        block: "nearest",
        behavior: "auto",
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [initialFrameSlug, setActiveIdx, stripRef]);

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
    scrollStripFrameIntoView(el, "data-filmframe", next, {
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
    window.setTimeout(() => syncActiveAndPlaying(el), 320);
  };

  const jumpToFrame = (next: number) => {
    const el = stripRef.current;
    if (!el || next < 0 || next >= WORKS.length) return;
    pauseAutoScroll();
    scheduleResume();
    setActiveIdx(next);
    scrollStripFrameIntoView(el, "data-filmframe", next, {
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
    window.setTimeout(() => syncActiveAndPlaying(el), 320);
  };

  const timelineStripHintId = "masthead-timeline-marquee-hint";

  return (
    <div
      style={{
        marginTop: 0,
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
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-tertiary)",
              }}
            >
              Index
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
              Timeline
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
              Motion and still work — client and studio pieces, newest first.
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
              {WORKS.length} works · {WORKS[WORKS.length - 1].year} – {WORKS[0].year}
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
              {reduceMotionProp
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
                {String(WORKS.length).padStart(2, "0")}
              </span>
            </p>
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
                  aria-label={`Show ${w.title} in timeline`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p
              id={timelineStripHintId}
              style={{
                margin: "10px 0 0",
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                lineHeight: 1.45,
                color: "var(--fg-tertiary)",
              }}
            >
              {MARQUEE_INTERACTION_HINT} {MARQUEE_TIMELINE_URL_HINT}
            </p>
          </div>
        </div>

        <div
          ref={stripRef}
          className="filmstrip-scroll"
          role="region"
          aria-label={
            reduceMotionProp
              ? "Timeline filmstrip — use arrow keys or drag to scroll"
              : "Timeline filmstrip — auto-scrolling; drag or wheel to pause"
          }
          aria-describedby={timelineStripHintId}
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
          .filmstrip-sidebar .marquee-sidebar-meta-line {
            display: none !important;
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
