// Works catalog.
//
// Data lives in `works.json` so the (dev-only) /admin page can edit it
// as plain JSON. The type definitions stay here alongside a typed
// loader so the rest of the codebase keeps using `import { WORKS }`.

import worksData from "./works.json";

export type WorkTone = "light" | "soft" | "dark" | "ui";

export type Work = {
  slug: string;
  n: string;          // catalog number, zero-padded
  year: number;
  title: string;
  kind: string;       // e.g. "Title sequence", "Type system"
  tone: WorkTone;
  dur?: string;       // runtime, e.g. "00:41"
  accent?: boolean;   // one-of signature highlight
  client?: string;
  role: string[];     // disciplines applied
  summary: string;    // single-sentence editorial note
  body?: string;      // long-form case study (optional)
  // HLS manifest URL (e.g. a Gumlet `main.m3u8`). When present, the frame
  // and case-study hero render a muted, looped preview instead of the
  // typographic placeholder.
  video?: string;
};

export const WORKS: Work[] = worksData as Work[];

export function getWork(slug: string): Work | undefined {
  return WORKS.find((w) => w.slug === slug);
}
