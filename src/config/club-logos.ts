/**
 * Emblems whose artwork is dark ink on transparency.
 *
 * They keep their exact colours in both themes — a club's emblem is its
 * identity, so recolouring it is not ours to do. On the dark surface these
 * marks get a soft light halo instead (see `.club-emblem--ink` in globals.css),
 * which separates them from the background without touching hue or saturation.
 *
 * Derived from the average luminance of the opaque pixels in /public/clubs
 * (ink ⇔ L* < 0.43). Recompute if an emblem is replaced.
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
