"use client";

import { useEffect, useRef, useState } from "react";
import { HlsVideo } from "./hls-video";
import { Mono } from "./mono";

/**
 * Signal plate.
 *
 * A single looping motion sample dropped between the masthead filmstrip and
 * the catalog — the editorial equivalent of a colour plate in a journal.
 * Runs muted by default; a discreet button under the plate lets visitors
 * unmute if they care to. Paused when scrolled off-screen so we never
 * leave an unattended stream running.
 */
export function Signal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  // Pause off-screen. `rootMargin` gives us a generous pre-roll so the frame
  // has usually attached by the time the plate scrolls into view.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px", threshold: 0.1 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Vanity ticker — counts up while the plate is "on air".
  useEffect(() => {
    if (!inView) return;
    const t = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [inView]);

  const elapsedLabel = `${Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0")}:${(elapsed % 60).toString().padStart(2, "0")}`;

  return (
    <section
      aria-label="Signal — transmission 01"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "48px 24px 40px",
        }}
      >
        {/* Dateline — the chrome distinguishes this from the catalog rows. */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
            borderBottom: "1px solid var(--fg-primary)",
            paddingBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <Mono>PLATE · SIGNAL · TRANSMISSION 01</Mono>
          <Mono style={{ color: "var(--fg-tertiary)" }}>
            ● ON AIR · {elapsedLabel}
          </Mono>
        </div>

        {/* The plate itself. 21:9 cinemascope, full bleed across the container. */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            marginTop: 18,
            aspectRatio: "21 / 9",
            borderRadius: 6,
            overflow: "hidden",
            background: "#000",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <HlsVideo
            src="https://video.gumlet.io/691b305b1eae6017804d722d/691bb20beee8975bcee8a6a2/main.m3u8"
            playing={inView}
            muted={muted}
            loop
            fit="cover"
            ariaLabel="Studio signal — a looping transmission"
          />

          {/* Protection gradient so the corner labels stay legible. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 28%, transparent 72%, rgba(0,0,0,0.38) 100%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 14,
              top: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 0 3px rgba(93, 63, 211, 0.22)",
              }}
            />
            <Mono style={{ color: "#F3F5F7" }}>LIVE</Mono>
          </div>

          <div
            style={{
              position: "absolute",
              right: 14,
              top: 12,
              display: "flex",
              gap: 8,
            }}
          >
            <Mono style={{ color: "rgba(243,245,247,0.64)" }}>21:9</Mono>
            <Mono style={{ color: "rgba(243,245,247,0.64)" }}>SRC · GUMLET</Mono>
          </div>

          <div
            style={{
              position: "absolute",
              left: 14,
              bottom: 12,
              display: "flex",
              gap: 10,
              alignItems: "baseline",
            }}
          >
            <Mono style={{ color: "#F3F5F7" }}>SIGNAL · 01</Mono>
            <Mono style={{ color: "rgba(243,245,247,0.64)" }}>
              a quiet transmission
            </Mono>
          </div>
        </div>

        {/* Caption strip — runtime, source, mute toggle. */}
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 16,
            alignItems: "baseline",
          }}
          className="signal-caption"
        >
          <Mono style={{ color: "var(--fg-secondary)" }}>
            — filed under signal, between frames.
          </Mono>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="t-label link"
            style={{
              background: "none",
              border: "1px solid var(--border-subtle)",
              padding: "6px 12px",
              borderRadius: 999,
              color: "var(--fg-primary)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
            aria-pressed={muted ? "false" : "true"}
          >
            {muted ? "♪ unmute" : "● mute"}
          </button>
          <Mono
            style={{ color: "var(--fg-tertiary)", textAlign: "right" }}
          >
            LOOP · NO AUDIO REQUIRED
          </Mono>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .signal-caption {
            grid-template-columns: 1fr !important;
            justify-items: start !important;
          }
          .signal-caption > *:last-child { text-align: left !important; }
        }
      `}</style>
    </section>
  );
}
