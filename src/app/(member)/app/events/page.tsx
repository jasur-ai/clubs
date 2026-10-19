import Link from "next/link";
import { CalendarDays, Check, MapPin, Users } from "lucide-react";
import { requireUserPage } from "@/lib/session";
import { db } from "@/lib/db";
import { formatDate, timeRange } from "@/lib/format";
import { rsvpAction } from "@/app/actions/member";
import { cn } from "@/lib/utils";

export default async function AppEventsPage() {
  const user = await requireUserPage();

  const [upcoming, past] = await Promise.all([
    db.event.findMany({
      where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 20,
      include: {
        club: { select: { name: true, slug: true, accent: true } },
        rsvps: { where: { userId: user.id } },
        _count: { select: { rsvps: true } },
      },
    }),
    db.event.findMany({
      where: { status: "PUBLISHED", startsAt: { lt: new Date() } },
      orderBy: { startsAt: "desc" },
      take: 5,
      include: { club: { select: { name: true, accent: true } }, _count: { select: { rsvps: true } } },
    }),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-[24px]">Tadbirlar</h1>

      <div className="space-y-2.5">
        {upcoming.map((e) => {
          const mine = e.rsvps[0];
          return (
            <div key={e.id} className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-4">
              <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: e.club.accent }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: e.club.accent }} />
                {e.club.name}
              </div>
              <Link href={`/events/${e.id}`} className="mt-1.5 block">
                <p className="font-serif text-[17px] leading-snug">{e.title}</p>
              </Link>
              <div className="mt-2 space-y-1 text-[11.5px] text-[color:var(--color-muted)]">
                <p className="flex items-center gap-1.5">
                  <CalendarDays size={12} /> {formatDate(e.startsAt, "d MMMM, EEEE")} · {timeRange(e.startsAt, e.endsAt)}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin size={12} /> {e.location}
                </p>
                <p className="flex items-center gap-1.5">
                  <Users size={12} /> {e._count.rsvps} qatnashuvchi{e.capacity ? ` · ${e.capacity} joy` : ""}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <form action={rsvpAction}>
                  <input type="hidden" name="eventId" value={e.id} />
                  <input type="hidden" name="status" value="GOING" />
                  <button className={cn("btn btn-sm w-full", mine?.status === "GOING" ? "btn-accent" : "btn-secondary")}>
                    {mine?.status === "GOING" ? <><Check size={13} /> Boraman</> : "Boraman"}
                  </button>
                </form>
                <form action={rsvpAction}>
                  <input type="hidden" name="eventId" value={e.id} />
                  <input type="hidden" name="status" value="CANCELLED" />
                  <button className={cn("btn btn-sm w-full", mine?.status === "CANCELLED" ? "btn-accent" : "btn-secondary")}>Bormayman</button>
                </form>
              </div>
            </div>
          );
        })}
        {upcoming.length === 0 && (
          <p className="rounded-[14px] border border-dashed border-[color:var(--color-line-strong)] bg-white p-6 text-center text-[12.5px] text-[color:var(--color-muted)]">
            Yaqin tadbir yo‘q.
          </p>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">O‘tgan</h2>
          <div className="overflow-hidden rounded-[12px] border border-[color:var(--color-line)] bg-white">
            {past.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="block border-b border-[color:var(--color-line)] px-3.5 py-2.5 last:border-0">
                <p className="text-[12.5px] font-medium">{e.title}</p>
                <p className="text-[10.5px] text-[color:var(--color-muted)]">
                  {formatDate(e.startsAt, "d MMM")} · {e.club.name} · {e._count.rsvps} qatnashdi
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
