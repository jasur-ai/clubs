import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(value: string) {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

/**
 * Single-event calendar file. Students live in their phone calendars; a channel
 * post scrolls away, an entry in the calendar does not.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: { club: { select: { name: true } } },
  });

  if (!event) return new Response("Tadbir topilmadi", { status: 404 });

  const start = event.startsAt;
  const end = event.endsAt ?? new Date(start.getTime() + 90 * 60 * 1000);
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tsue-clubs.onrender.com").replace(/\/$/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TDIU Clubs//Tadbirlar//UZ",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@tdiu-clubs`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.location)}`,
    `DESCRIPTION:${escape(`${event.club.name} · ${site}/events/${event.id}`)}`,
    `URL:${site}/events/${event.id}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="tdiu-${event.id.slice(0, 8)}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
