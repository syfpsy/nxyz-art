import { getPerson, type Person } from "@/content/people";
import { WORKS } from "@/content/works";

/** ISO week number 1–53 (Monday-based). */
function isoWeekNumber(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((+t - +y1) / 86400000 + 1) / 7);
}

/**
 * Deterministic “rotation” line for the footer: people who appear on credited
 * works, cycled by ISO week so the line changes weekly without a CMS.
 */
export function getWeeklyRotationCredits(): { line: string; people: Person[] } {
  const slugOrder: string[] = [];
  const seen = new Set<string>();
  for (const w of WORKS) {
    for (const s of w.personSlugs ?? []) {
      if (!seen.has(s)) {
        seen.add(s);
        slugOrder.push(s);
      }
    }
  }
  if (slugOrder.length === 0) {
    return {
      line: "",
      people: [],
    };
  }
  const week = isoWeekNumber(new Date());
  const n = slugOrder.length;
  const start = week % n;
  const rotated = [...slugOrder.slice(start), ...slugOrder.slice(0, start)];
  const people = rotated
    .slice(0, Math.min(4, rotated.length))
    .map((s) => getPerson(s))
    .filter((p): p is Person => p !== undefined);
  if (people.length === 0) {
    return { line: "", people: [] };
  }
  const line = `This week’s file includes ${people.map((p) => p.name).join(", ")}.`;
  return { line, people };
}
