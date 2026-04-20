// Works catalog.
// These are the placeholders from the design system prototype.
// Swap with real projects when ready.

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

export const WORKS: Work[] = [
  {
    slug: "meridian",
    n: "01",
    year: 2026,
    title: "Meridian",
    kind: "Title sequence",
    tone: "soft",
    dur: "00:41",
    accent: true,
    client: "Meridian Film Festival",
    role: ["Direction", "Motion", "Type"],
    summary:
      "A 41-second festival opener built around a single horizon line and a type system that reads like a dateline.",
    body:
      "Meridian screens each fall in a converted print shop. The brief: a title that doesn't announce itself. We settled on a horizon that holds across forty-one seconds while the year, city, and programme set in a wide mono beside it. No logo reveal. No music sting.",
    video:
      "https://video.gumlet.io/691b305b1eae6017804d722d/691bb39715bb3da8628c759c/main.m3u8",
  },
  {
    slug: "field",
    n: "02",
    year: 2025,
    title: "Field",
    kind: "Type system",
    tone: "light",
    role: ["Type", "Systems"],
    summary:
      "A five-weight geometric sans drawn for a research lab, tuned for long reading at small sizes.",
    body:
      "Field was commissioned for a quarterly research memo that lives in print and on screen. Five weights, one italic, tabular figures throughout. The brief asked for 'authoritative, never shouty' — so the caps height is low and the x-height is generous.",
    video:
      "https://video.gumlet.io/691b305b1eae6017804d722d/691b885315bb3da86289b804/main.m3u8",
  },
  {
    slug: "cassette",
    n: "03",
    year: 2025,
    title: "Cassette",
    kind: "Brand + motion",
    tone: "dark",
    dur: "02:14",
    client: "Cassette Records",
    role: ["Identity", "Motion", "Creative direction"],
    summary:
      "An identity system for an independent record label, delivered with a 2:14 launch film.",
    video:
      "https://video.gumlet.io/691b305b1eae6017804d722d/691bb15feee8975bcee89df9/main.m3u8",
  },
  {
    slug: "ridgeline",
    n: "04",
    year: 2024,
    title: "Ridgeline",
    kind: "Product UI",
    tone: "ui",
    role: ["Interface", "Prototype", "Systems"],
    summary:
      "A design language and component library for a climate-modelling product used by public-sector planners.",
    video:
      "https://video.gumlet.io/691b305b1eae6017804d722d/691b5fe715bb3da86286df49/main.m3u8",
  },
  {
    slug: "orbit",
    n: "05",
    year: 2024,
    title: "Orbit",
    kind: "Interactive",
    tone: "soft",
    role: ["Interactive", "Motion"],
    summary:
      "A long-scroll essay about satellite graveyards, paced so the reader never loses the horizon.",
    video:
      "https://video.gumlet.io/691b305b1eae6017804d722d/691bb396eee8975bcee8bbc0/main.m3u8",
  },
  {
    slug: "vellum",
    n: "06",
    year: 2023,
    title: "Vellum",
    kind: "Editorial + web",
    tone: "light",
    role: ["Editorial", "Web"],
    summary:
      "An editorial system for a bi-annual design journal — print-first, with a restrained web companion.",
    video:
      "https://video.gumlet.io/691b305b1eae6017804d722d/691b6c2b15bb3da86287ed65/main.m3u8",
  },
  {
    slug: "harbour",
    n: "07",
    year: 2023,
    title: "Harbour",
    kind: "Motion identity",
    tone: "dark",
    dur: "00:12",
    role: ["Identity", "Motion"],
    summary:
      "A twelve-second motion identity for a maritime documentary strand.",
    video:
      "https://video.gumlet.io/691b305b1eae6017804d722d/691bb229eee8975bcee8a80b/main.m3u8",
  },
  {
    slug: "prism",
    n: "08",
    year: 2022,
    title: "Prism",
    kind: "Experiment",
    tone: "ui",
    role: ["Experiment", "Interface"],
    summary:
      "An early experiment in chromatic type rendering — a private sketch that became the studio's first public release.",
    video:
      "https://video.gumlet.io/691b305b1eae6017804d722d/691bb14515bb3da8628c5718/main.m3u8",
  },
];

export function getWork(slug: string): Work | undefined {
  return WORKS.find((w) => w.slug === slug);
}
