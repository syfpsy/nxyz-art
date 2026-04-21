import type { Work } from "@/content/works";
import { WORKS } from "@/content/works";

/** Periodic table element symbols — must match `periodic-table.tsx` order. */
export const PERIODIC_ELEMENT_KEYS = [
  "Mt",
  "Ti",
  "Id",
  "Ty",
  "Ui",
  "Pr",
  "Ed",
  "Ar",
  "Ex",
  "Ss",
  "Tl",
  "Cd",
] as const;

export type PeriodicElementKey = (typeof PERIODIC_ELEMENT_KEYS)[number];

/**
 * Heuristic: each work can increment multiple practice buckets from kind,
 * title, summary, and role lines (lowercased keyword scan).
 */
export function tagsForWork(w: Work): Set<PeriodicElementKey> {
  const hay = [w.kind, w.title, w.summary, ...(w.role ?? []), w.body ?? ""]
    .join(" ")
    .toLowerCase();
  const tags = new Set<PeriodicElementKey>();

  const has = (re: RegExp) => re.test(hay);

  if (has(/\bmotion\b|moving image|animation|film|sequence|launch film/))
    tags.add("Mt");
  if (has(/\btitle\b|opening|festival opener|opener/)) tags.add("Ti");
  if (has(/\bidentity\b|\bbrand\b|records\b|label\b|maritime/)) tags.add("Id");
  if (has(/\btype\b|typograph|font|sans|weight|glyph/)) tags.add("Ty");
  if (has(/\binterface\b|\bui\b|component|product ui|screen|dashboard/))
    tags.add("Ui");
  if (has(/\bprototype\b|wireframe|specimen/)) tags.add("Pr");
  if (has(/\beditorial\b|journal|publication|essay|quarterly|memo|annual/))
    tags.add("Ed");
  if (has(/\barchive\b|catalog|folio/)) tags.add("Ar");
  if (has(/\bexperiment\b|sketch|chromatic|early|lab\b/)) tags.add("Ex");
  if (has(/\bsound\b|audio\b|music\b/)) tags.add("Ss");
  if (has(/\btool\b|utility|instrument/)) tags.add("Tl");
  if (has(/\bcreative direction\b|\bdirection\b|creative dir/)) tags.add("Cd");

  if (tags.size === 0) tags.add("Ex");
  return tags;
}

export function countPeriodicFromWorks(works: Work[] = WORKS): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const k of PERIODIC_ELEMENT_KEYS) counts[k] = 0;
  for (const w of works) {
    for (const t of tagsForWork(w)) {
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
}
