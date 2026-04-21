// People — personal portfolio profiles tied to the studio, backed by
// `people.json` (same pattern as works / products).

import peopleData from "./people.json";
import { WORKS, getWork, type Work } from "./works";

export type PersonLink = { label: string; href: string };

export type PersonOtherWork = {
  title: string;
  href: string;
  year?: string;
  note?: string;
};

/**
 * A person in the network. `photoSrc` is optional: put a 4:5 or square JPG
 * under public/people/{slug}.jpg and set photoSrc to "/people/{slug}.jpg".
 */
export type Person = {
  slug: string;
  n: string;
  name: string;
  role: string;
  tagline: string;
  bio: string[];
  photoSrc: string | null;
  links: PersonLink[];
  /** Studio work to feature (matches `works.json` slugs). */
  workSlugs: string[];
  /** Projects outside the nxyz work archive — talks, other sites, etc. */
  otherWork?: PersonOtherWork[];
};

export const PEOPLE: Person[] = peopleData as Person[];

export function getPerson(slug: string): Person | undefined {
  return PEOPLE.find((p) => p.slug === slug);
}

/**
 * Creators for a work (from `work.personSlugs`), in listed order. Unknown
 * slugs are skipped; use placeholders in the UI if you need a slot.
 */
export function getCreatorsForWork(w: Work): Person[] {
  const slugs = w.personSlugs;
  if (!slugs?.length) return [];
  return slugs
    .map((slug) => getPerson(slug))
    .filter((p): p is Person => p !== undefined);
}

/** Human-readable "Name · Name" for list rows. Unknown slugs pass through. */
export function getWorkCreatorNameLine(w: Work): string {
  if (!w.personSlugs?.length) return "";
  return w.personSlugs
    .map((s) => getPerson(s)?.name ?? s)
    .join(" · ");
}

export function getWorksForPerson(p: Person): Work[] {
  const bySlug = new Map<string, Work>();
  for (const ws of p.workSlugs) {
    const w = getWork(ws);
    if (w) bySlug.set(w.slug, w);
  }
  for (const w of WORKS) {
    if (w.personSlugs?.includes(p.slug)) bySlug.set(w.slug, w);
  }
  return Array.from(bySlug.values());
}
