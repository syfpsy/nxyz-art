import { getPerson, type Person } from "@/content/people";
import { WORKS, type Work } from "@/content/works";

/** Other archive works that share at least one credited creator. */
export function getRelatedWorksBySharedCreators(current: Work, limit = 5): Work[] {
  const mine = new Set(current.personSlugs ?? []);
  if (mine.size === 0) return [];
  const out: Work[] = [];
  for (const o of WORKS) {
    if (o.slug === current.slug) continue;
    const theirs = new Set(o.personSlugs ?? []);
    for (const p of mine) {
      if (theirs.has(p)) {
        out.push(o);
        break;
      }
    }
  }
  out.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return out.slice(0, limit);
}

/** People who often appear on the same works as this person (studio network). */
export function getFrequentCoCreators(
  person: Person,
  limit = 4,
): { peer: Person; sharedWorks: number }[] {
  const myWorks = new Set(
    WORKS.filter(
      (w) =>
        w.personSlugs?.includes(person.slug) || person.workSlugs.includes(w.slug),
    ).map((w) => w.slug),
  );
  if (myWorks.size === 0) return [];
  const score = new Map<string, number>();
  for (const slug of myWorks) {
    const w = WORKS.find((x) => x.slug === slug);
    if (!w?.personSlugs?.length) continue;
    for (const ps of w.personSlugs) {
      if (ps === person.slug) continue;
      score.set(ps, (score.get(ps) ?? 0) + 1);
    }
  }
  const ranked = [...score.entries()]
    .map(([slug, n]) => {
      const p = getPerson(slug);
      return p ? { peer: p, sharedWorks: n } : null;
    })
    .filter((x): x is { peer: Person; sharedWorks: number } => x !== null)
    .sort((a, b) => b.sharedWorks - a.sharedWorks);
  return ranked.slice(0, limit);
}
