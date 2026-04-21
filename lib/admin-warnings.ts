import type { Person } from "@/content/people";
import type { Work } from "@/content/works";

/** Non-blocking checks for attribution consistency (shown in admin only). */
export function buildAdminWarnings(works: Work[], people: Person[]): string[] {
  const personSlugs = new Set(people.map((p) => p.slug));
  const workSlugs = new Set(works.map((w) => w.slug));
  const out: string[] = [];

  for (const w of works) {
    for (const ps of w.personSlugs ?? []) {
      if (!personSlugs.has(ps)) {
        out.push(`Work “${w.title}”: unknown person slug “${ps}”.`);
      }
    }
  }

  for (const p of people) {
    for (const ws of p.workSlugs) {
      if (!workSlugs.has(ws)) {
        out.push(`Person “${p.name}”: workSlugs references missing work “${ws}”.`);
      }
    }
  }

  const syncSeen = new Set<string>();
  for (const w of works) {
    for (const ps of w.personSlugs ?? []) {
      const p = people.find((x) => x.slug === ps);
      if (!p) continue;
      if (!p.workSlugs.includes(w.slug)) {
        const key = `${p.slug}:${w.slug}`;
        if (!syncSeen.has(key)) {
          syncSeen.add(key);
          out.push(
            `“${w.title}” credits “${p.name}” but their profile workSlugs doesn’t list this work.`,
          );
        }
      }
    }
  }

  return [...new Set(out)].slice(0, 10);
}
