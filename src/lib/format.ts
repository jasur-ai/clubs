import { format, formatDistanceToNowStrict, isToday, isTomorrow } from "date-fns";
import { uz } from "date-fns/locale";

const TZ_NOTE = "Asia/Tashkent";

export function formatDate(date: Date | string, pattern = "d MMMM, yyyy") {
  return format(new Date(date), pattern, { locale: uz });
}

export function formatDateTime(date: Date | string) {
  return `${formatDate(date, "d MMMM, HH:mm")}`;
}

export function formatWeekday(date: Date | string) {
  return format(new Date(date), "EEEE", { locale: uz });
}

export function relativeDate(date: Date | string) {
  const d = new Date(date);
  if (isToday(d)) return "Bugun";
  if (isTomorrow(d)) return "Ertaga";
  return formatDistanceToNowStrict(d, { locale: uz, addSuffix: true });
}

export function timeRange(startsAt: Date | string, endsAt?: Date | string | null) {
  const start = format(new Date(startsAt), "HH:mm");
  if (!endsAt) return start;
  return `${start} – ${format(new Date(endsAt), "HH:mm")}`;
}

export function monthYear(date: Date | string) {
  return format(new Date(date), "LLLL yyyy", { locale: uz });
}

export function isoDate(date: Date | string) {
  return format(new Date(date), "yyyy-MM-dd");
}

export { TZ_NOTE };
