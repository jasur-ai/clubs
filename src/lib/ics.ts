import "server-only";

export type CalendarEvent = {
  id: string;
  title: string;
  location: string;
  description?: string | null;
  startsAt: Date;
  endsAt: Date | null;
  clubName: string;
};

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(value: string) {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

/** Long lines must be folded at 75 octets per RFC 5545. */
function fold(line: string) {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 73)}`);
    rest = rest.slice(73);
  }
  return parts.join("\r\n");
}

/**
 * Builds a single VCALENDAR for one or many events.
 *
 * Students live in their phone calendars: a channel post scrolls away, a
 * calendar entry with a two-hour reminder does not.
 */
export function buildCalendar(events: CalendarEvent[], calendarName: string) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tsue-clubs.onrender.com").replace(/\/$/, "");

  const blocks = events.map((event) => {
    const start = event.startsAt;
    const end = event.endsAt ?? new Date(start.getTime() + 90 * 60 * 1000);
    const url = `${site}/events/${event.id}`;
    const description = [event.clubName, event.description?.trim(), url].filter(Boolean).join(" · ");

    return [
      "BEGIN:VEVENT",
      `UID:${event.id}@tdiu-clubs`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(event.title)}`,
      `LOCATION:${escape(event.location)}`,
      `DESCRIPTION:${escape(description)}`,
      `URL:${url}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escape(event.title)}`,
      "END:VALARM",
      "END:VEVENT",
    ];
  });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TDIU Clubs//Tadbirlar//UZ",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escape(calendarName)}`,
    ...blocks.flat(),
    "END:VCALENDAR",
  ];

  return `${lines.map(fold).join("\r\n")}\r\n`;
}

export const ICS_HEADERS = {
  "Content-Type": "text/calendar; charset=utf-8",
  "Cache-Control": "no-store",
} as const;
