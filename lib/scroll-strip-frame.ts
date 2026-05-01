export type StripFrameAttr = "data-filmframe" | "data-appframe";

/** `[frameIndex, distanceToStripCenter]` nearest first — used for active tile + video cap. */
export function sortedStripFrameIndices(
  strip: HTMLElement,
  frameAttr: StripFrameAttr,
): [number, number][] {
  const sr = strip.getBoundingClientRect();
  if (sr.width < 8) return [];
  const center = sr.left + sr.width / 2;
  const byIndex = new Map<number, number>();
  const selector = frameAttr === "data-filmframe" ? "a[data-filmframe]" : "a[data-appframe]";

  strip.querySelectorAll<HTMLElement>(selector).forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.width < 4) return;
    const overlaps = r.right > sr.left && r.left < sr.right;
    if (!overlaps) return;
    const mid = (r.left + r.right) / 2;
    const dist = Math.abs(mid - center);
    const raw =
      frameAttr === "data-filmframe" ? node.dataset.filmframe : node.dataset.appframe;
    const idx = raw !== undefined ? Number(raw) : NaN;
    if (!Number.isFinite(idx)) return;
    const prev = byIndex.get(idx);
    if (prev === undefined || dist < prev) byIndex.set(idx, dist);
  });
  return [...byIndex.entries()].sort((a, b) => a[1] - b[1]);
}

export function dominantStripFrameIndex(
  strip: HTMLElement,
  frameAttr: StripFrameAttr,
  fallback = 0,
): number {
  return sortedStripFrameIndices(strip, frameAttr)[0]?.[0] ?? fallback;
}

/**
 * Marquee strips duplicate items in two columns. `querySelector` always hits
 * the first DOM node, which can be off-screen and cause long jumps.
 * Choose the duplicate whose midpoint is closest to the strip center.
 */
export function scrollStripFrameIntoView(
  strip: HTMLElement,
  frameAttr: StripFrameAttr,
  index: number,
  options: ScrollIntoViewOptions,
) {
  const nodes = strip.querySelectorAll<HTMLElement>(`a[${frameAttr}="${index}"]`);
  const sr = strip.getBoundingClientRect();
  if (sr.width < 8 || nodes.length === 0) return;
  const center = sr.left + sr.width / 2;
  let best: HTMLElement | null = null;
  let bestDist = Infinity;
  for (const node of nodes) {
    const r = node.getBoundingClientRect();
    if (r.width < 4) continue;
    const mid = (r.left + r.right) / 2;
    const dist = Math.abs(mid - center);
    if (dist < bestDist) {
      bestDist = dist;
      best = node;
    }
  }
  best?.scrollIntoView(options);
}
