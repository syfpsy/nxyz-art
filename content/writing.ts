// Writing — the journal.
// Short, dated notes. Editorial in tone. Think "senior designer's notebook".

export type Writing = {
  slug: string;
  n: string;
  date: string;        // ISO date
  title: string;
  dek: string;         // one-line summary / subtitle
  readingMinutes: number;
  body?: string;       // optional long-form; rendered into .prose
};

export const WRITING: Writing[] = [
  {
    slug: "on-restraint",
    n: "01",
    date: "2026-04-12",
    title: "On restraint",
    dek: "Why the studio turns down two-thirds of the work it's asked to make, and what that does to the rest.",
    readingMinutes: 4,
    body:
      "There is a version of this studio that takes every brief. It is not the version that would still exist in five years. Restraint is not the absence of ambition. It is the shape of it.",
  },
  {
    slug: "typography-is-the-brand",
    n: "02",
    date: "2026-03-20",
    title: "Typography is the brand",
    dek: "A short argument against decorative systems, and for the rectangle-and-the-letter as the foundation.",
    readingMinutes: 6,
  },
  {
    slug: "slow-correspondence",
    n: "03",
    date: "2026-02-05",
    title: "Slow correspondence",
    dek: "How the studio works across time zones without Slack, stand-ups, or synchronous meetings.",
    readingMinutes: 5,
  },
  {
    slug: "notes-on-motion",
    n: "04",
    date: "2025-12-28",
    title: "Notes on motion",
    dek: "Six rules for moving things on screen so they still feel like they're standing still.",
    readingMinutes: 7,
  },
];

export function getWriting(slug: string): Writing | undefined {
  return WRITING.find((w) => w.slug === slug);
}
