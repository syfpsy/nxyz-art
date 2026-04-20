"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type HlsVideoProps = {
  /** HLS manifest URL (`.m3u8`). */
  src: string;
  /** When true, component attempts to `.play()`. When false, it pauses. */
  playing?: boolean;
  /** Expose browser-native media controls (used on the case-study hero). */
  controls?: boolean;
  /** Default true — autoplay in most browsers requires muted + playsInline. */
  muted?: boolean;
  /** Default true. */
  loop?: boolean;
  /** object-fit — "cover" for thumbnails, "contain" for case-study hero. */
  fit?: "cover" | "contain";
  /** Optional poster image shown before first frame is ready. */
  poster?: string;
  /** Accessible label for the video element. */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Minimal HLS player.
 *
 * - Uses native HLS in Safari and iOS (both support `.m3u8` directly).
 * - Elsewhere, lazy-imports `hls.js` on mount so the library is only pulled
 *   in on pages that actually need it.
 * - `playing` is a controlled prop: parents decide when the video runs,
 *   which keeps the filmstrip to one active stream at a time.
 */
export function HlsVideo({
  src,
  playing = true,
  controls = false,
  muted = true,
  loop = true,
  fit = "cover",
  poster,
  ariaLabel,
  className,
  style,
}: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  // Attach the manifest to the <video>. We prefer the browser's native HLS
  // support when available; otherwise we spin up an hls.js instance.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    // Using `unknown` keeps us free of an `any` while the type is only known
    // after the dynamic import resolves.
    let hls: { destroy: () => void } | null = null;

    const canPlayNative = video.canPlayType("application/vnd.apple.mpegurl");

    if (canPlayNative) {
      video.src = src;
      setReady(true);
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    // Dynamic import so hls.js only ships to browsers that need it, and only
    // when a page actually mounts a player.
    import("hls.js").then((mod) => {
      if (cancelled) return;
      const Hls = mod.default;
      if (!Hls.isSupported()) {
        // Last-ditch: try setting the src directly — some browsers will cope.
        video.src = src;
        setReady(true);
        return;
      }
      const instance = new Hls({
        // Keep the player light: small forward buffer, no tail buffer for loops.
        maxBufferLength: 12,
        maxMaxBufferLength: 24,
        lowLatencyMode: false,
      });
      instance.loadSource(src);
      instance.attachMedia(video);
      hls = instance;
      instance.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!cancelled) setReady(true);
      });
    });

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [src]);

  // Drive play/pause from the `playing` prop. `.play()` returns a promise;
  // ignore rejections (autoplay block, user gesture required, unmount races).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready) return;
    if (playing) {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => undefined);
    } else {
      video.pause();
    }
  }, [playing, ready]);

  return (
    <video
      ref={videoRef}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={ariaLabel}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        objectFit: fit,
        display: "block",
        ...style,
      }}
    />
  );
}
