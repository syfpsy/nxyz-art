// People — personal portfolio profiles tied to the studio, backed by
// `people.json` (same pattern as works / products).

import peopleData from "./people.json";
import { getWork, type Work } from "./works";

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

export function getWorksForPerson(p: Person): Work[] {
  const out: Work[] = [];
  for (const slug of p.workSlugs) {
    const w = getWork(slug);
    if (w) out.push(w);
  }
  return out;
}
