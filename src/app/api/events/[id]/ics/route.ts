import { db } from "@/lib/db";
import { buildCalendar, ICS_HEADERS } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: { club: { select: { name: true } } },
  });

  if (!event) return new Response("Tadbir topilmadi", { status: 404 });

  const body = buildCalendar(
    [
      {
        id: event.id,
        title: event.title,
        location: event.location,
        description: event.description,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        clubName: event.club.name,
      },
    ],
    event.title,
  );

  return new Response(body, {
    headers: {
      ...ICS_HEADERS,
      "Content-Disposition": `attachment; filename="tdiu-${event.id.slice(0, 8)}.ics"`,
    },
  });
}
