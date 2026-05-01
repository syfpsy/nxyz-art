"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

const RESUME_AUTO_MS = 2800;

export type MaintainDupHalf = (
  strip: HTMLDivElement,
  inner: HTMLDivElement,
) => void;

/**
 * Shared behavior for the home masthead horizontal marquees: slow auto-scroll
 * with seamless duplicated row, drag + wheel pause, and reduced-motion guard.
 */
export function useHorizontalMarqueeStrip({
  reduceMotion,
  autoScrollPxPerSecond,
  syncFromStrip,
  maintainDupHalf,
}: {
  reduceMotion: boolean;
  autoScrollPxPerSecond: number;
  syncFromStrip: (strip: HTMLElement) => void;
  /** Optional: filmstrip keeps HLS decode on one duplicated row via scroll half. */
  maintainDupHalf?: MaintainDupHalf;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const autoPausedRef = useRef(false);
  const rafRef = useRef(0);
  const scrollSyncRaf = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotionRef = useRef(false);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: 0,
    pointerId: 0,
  });

  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

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
    }, RESUME_AUTO_MS);
  }, []);

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
        maintainDupHalf?.(el, inn);
        if (
          loopW > 2 &&
          maxScroll > 0 &&
          !autoPausedRef.current &&
          !reduceMotionRef.current
        ) {
          let next = el.scrollLeft + (autoScrollPxPerSecond * dt) / 1000;
          while (next >= loopW) next -= loopW;
          el.scrollLeft = Math.max(0, next);
        }
        n++;
        if (n % 5 === 0) syncFromStrip(el);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduceMotion, syncFromStrip, maintainDupHalf, autoScrollPxPerSecond]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = stripRef.current;
      if (el) syncFromStrip(el);
    });
    return () => cancelAnimationFrame(id);
  }, [syncFromStrip]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      cancelAnimationFrame(scrollSyncRaf.current);
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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
      } catch {
        /* capture can fail for disconnected nodes */
      }
      el.setAttribute("data-dragging", "true");
    },
    [pauseAutoScroll],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const el = stripRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    el.scrollLeft = d.startScroll - dx;
  }, []);

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = stripRef.current;
      const d = dragRef.current;
      if (!el || !d.active) return;
      const { pointerId } = e;
      try {
        el.releasePointerCapture(pointerId);
      } catch {
        /* ignore */
      }
      d.active = false;
      el.removeAttribute("data-dragging");
      syncFromStrip(el);
      scheduleResume();
    },
    [syncFromStrip, scheduleResume],
  );

  const onScrollStrip = useCallback(() => {
    const el = stripRef.current;
    const inn = innerRef.current;
    if (!el) return;
    if (!reduceMotionRef.current && !autoPausedRef.current) return;
    if (inn) maintainDupHalf?.(el, inn);
    cancelAnimationFrame(scrollSyncRaf.current);
    scrollSyncRaf.current = requestAnimationFrame(() => syncFromStrip(el));
  }, [syncFromStrip, maintainDupHalf]);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
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
      syncFromStrip(el);
    },
    [pauseAutoScroll, scheduleResume, syncFromStrip],
  );

  const suppressClickIfDragged = useCallback(() => dragRef.current.moved > 5, []);

  const isPointerDragActive = useCallback(() => dragRef.current.active, []);

  return {
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
  };
}
