// Experiments — the "lab" index.
// Short sketches, studies, and one-offs. Less polished than Works.

export type Experiment = {
  slug: string;
  n: string;          // zero-padded
  date: string;       // ISO date
  title: string;
  kind: string;       // e.g. "Shader", "Type study", "Generative"
  status: "draft" | "open" | "archived";
  summary: string;
  body?: string;
};

export const EXPERIMENTS: Experiment[] = [
  {
    slug: "001-dateline",
    n: "001",
    date: "2026-04-02",
    title: "Dateline",
    kind: "Type study",
    status: "open",
    summary:
      "A masthead component that renders a live dateline in any timezone, set in JetBrains Mono at 11px.",
  },
  {
    slug: "002-horizon",
    n: "002",
    date: "2026-03-11",
    title: "Horizon",
    kind: "Motion sketch",
    status: "open",
    summary:
      "One line, forty-one seconds, no easing curve more complex than a quiet smooth-in.",
  },
  {
    slug: "003-folio",
    n: "003",
    date: "2026-02-20",
    title: "Folio",
    kind: "Layout study",
    status: "draft",
    summary:
      "A twelve-column grid that treats every section as a signature in a printed book.",
  },
  {
    slug: "004-ticker",
    n: "004",
    date: "2026-01-28",
    title: "Ticker",
    kind: "Interface",
    status: "open",
    summary:
      "A live run-counter that reveals one new digit per second without ever overflowing its frame.",
  },
  {
    slug: "005-signal",
    n: "005",
    date: "2025-12-14",
    title: "Signal",
    kind: "Generative",
    status: "archived",
    summary:
      "Five overlapping sine waves and one thin violet rule. The composition settles after fifteen seconds.",
  },
  {
    slug: "006-colophon",
    n: "006",
    date: "2025-11-02",
    title: "Colophon",
    kind: "Editorial",
    status: "open",
    summary:
      "A back-of-book page for a web studio — tools, typefaces, office coffee, current reading.",
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.slug === slug);
}
