import { format, formatDistance, isToday, isTomorrow } from "date-fns";
import { uz } from "date-fns/locale";

/**
 * Everything the site prints is Tashkent time.
 *
 * The server runs in UTC, the visitor may be anywhere, and a club announcement
 * always means "15:00 at the 2-bino". Formatting the raw instant would print
 * 10:00 on a UTC server — the exact kind of small lie that makes a schedule
 * useless. So every helper below first moves the instant onto the Tashkent
 * wall clock and then formats that. Uzbekistan has used UTC+5 with no daylight
 * saving since 1992, so a constant offset is the correct model, not a shortcut.
 */
export const TZ_NOTE = "Asia/Tashkent";
const TZ_OFFSET_MIN = 5 * 60;

/**
 * Same instant, expressed so that the environment's own local-time getters
 * (which is what date-fns reads) return the Tashkent clock. Works whatever
 * timezone the process happens to be in.
 */
function wall(date: Date | string) {
  const d = new Date(date);
  return new Date(d.getTime() + (TZ_OFFSET_MIN + d.getTimezoneOffset()) * 60_000);
}

/** Real UTC instant of 00:00 Tashkent on the day that contains `date`. */
export function tashkentDayStart(date: Date | string = new Date()) {
  const shifted = new Date(new Date(date).getTime() + TZ_OFFSET_MIN * 60_000);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - TZ_OFFSET_MIN * 60_000);
}

/** `yyyy-mm-dd` of the Tashkent day that contains `date` — safe to compare. */
export function tashkentDayKey(date: Date | string) {
  return new Date(new Date(date).getTime() + TZ_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, in Tashkent. */
export function tashkentWeekday(date: Date | string) {
  return new Date(new Date(date).getTime() + TZ_OFFSET_MIN * 60_000).getUTCDay();
}

export function formatDate(date: Date | string, pattern = "d MMMM, yyyy") {
  return format(wall(date), pattern, { locale: uz });
}

export function formatDateTime(date: Date | string) {
  return formatDate(date, "d MMMM, HH:mm");
}

export function formatWeekday(date: Date | string) {
  return format(wall(date), "EEEE", { locale: uz });
}

export function relativeDate(date: Date | string) {
  const target = wall(date);
  if (isToday(target)) return "Bugun";
  if (isTomorrow(target)) return "Ertaga";
  return formatDistance(target, wall(new Date()), { locale: uz, addSuffix: true });
}

export function timeRange(startsAt: Date | string, endsAt?: Date | string | null) {
  const start = format(wall(startsAt), "HH:mm");
  if (!endsAt) return start;
  return `${start} – ${format(wall(endsAt), "HH:mm")}`;
}

export function monthYear(date: Date | string) {
  return format(wall(date), "LLLL yyyy", { locale: uz });
}

export function isoDate(date: Date | string) {
  return format(wall(date), "yyyy-MM-dd");
}

/* ------------------------------------------------------- admin date inputs --- */

/**
 * `<input type="datetime-local">` speaks wall-clock time with no timezone, and
 * the people filling it in are in Tashkent. Parsing the value with `new Date()`
 * on a UTC server would quietly add five hours to every event an admin saves.
 */
export function fromTashkentInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute));
}

/** The reverse: an instant rendered for a `datetime-local` input, in Tashkent. */
export function toTashkentInput(date: Date | string): string {
  return new Date(new Date(date).getTime() + TZ_OFFSET_MIN * 60_000).toISOString().slice(0, 16);
}
