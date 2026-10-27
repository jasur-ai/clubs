/**
 * Emblems whose artwork is dark ink on transparency.
 *
 * They keep their exact colours in both themes — a club's emblem is its
 * identity, so recolouring it is not ours to do. On the dark surface we do not
 * draw a halo either: any blurred glow around a 44 px mark smears its small
 * lettering into mush. The mark is simply lifted a little in brightness, with a
 * touch of saturation so the lift does not read as a fade, and the shape stays
 * razor sharp (see `.club-emblem--ink` in globals.css).
 *
 * The lift is per emblem because the emblems are not one colour. Values come
 * from the mean luminance of each PNG's opaque pixels: the darker the artwork,
 * the more lift it can take before its highlights clip.
 *
 *   mean L*   .  lift
 *   < 20          2.00
 *   20–45         1.90
 *   45–60         1.80
 *   60–70         1.55
 *   70–85         1.35
 *   85–100        1.25
 *   > 100         1.15
 *
 * Recompute if an emblem is replaced: mean L* below ~0.43 is what decides
 * whether a slug belongs in this set at all.
 */
export const CLUBS_WITH_INK_EMBLEM = new Set<string>([
  "art-club",
  "cybersport",
  "debate",
  "ijodkor",
  "international",
  "iqtisodchilar",
  "it-club",
  "mushoira",
  "networking",
  "rekordlar",
  "running-club",
  "speaking",
  "sport",
  "students-union",
  "travel-club",
  "wikiclub",
  "zakovat",
]);

/** Dark-theme brightness lift, keyed by emblem file / club slug. */
export const INK_EMBLEM_LIFT: Record<string, number> = {
  cybersport: 2.0,
  network: 2.0,
  networking: 2.0,
  debate: 1.95,
  ijodkor: 1.85,
  iqtisodchilar: 1.85,
  zakovat: 1.8,
  "running-club": 1.8,
  "it-club": 1.7,
  rekordlar: 1.55,
  "students-union": 1.55,
  "travel-club": 1.4,
  international: 1.35,
  mushoira: 1.3,
  sport: 1.25,
  "art-club": 1.25,
  speaking: 1.2,
  wikiclub: 1.15,
};

export function inkEmblemLift(slug: string): number {
  return INK_EMBLEM_LIFT[slug] ?? 1.4;
}
