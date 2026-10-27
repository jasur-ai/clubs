import type { Metadata } from "next";
import Link from "next/link";
import { addDays } from "date-fns";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, tashkentDayKey, tashkentDayStart, tashkentWeekday, timeRange } from "@/lib/format";
import { dayIndex } from "@/lib/discovery";
import { ShareButton } from "@/components/site/share-button";

export const metadata: Metadata = {
  title: "Bu hafta",
  description: "Kelasi yetti kunda TDIU klublarida nima bo‘ladi — bir sahifada.",
};

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

export default async function WeekPage() {
  const from = tashkentDayStart();
  const to = addDays(from, 7);

  const [events, clubs] = await Promise.all([
    db.event.findMany({
      where: { status: "PUBLISHED", startsAt: { gte: from, lt: to } },
      orderBy: { startsAt: "asc" },
      include: {
        club: { select: { name: true, slug: true, accent: true } },
        _count: { select: { rsvps: true } },
      },
    }),
    db.club.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, accent: true, meetingDay: true, meetingTime: true, location: true },
    }),
  ]);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(from, index);
    const dayName = DAY_NAMES[tashkentWeekday(date)];
    const key = tashkentDayKey(date);
    return {
      date,
      dayName,
      events: events.filter((event) => tashkentDayKey(event.startsAt) === key),
      meetings: clubs.filter((club) => club.meetingDay && dayIndex(club.meetingDay) === dayIndex(dayName)),
    };
  });

  const quiet = days.filter((day) => day.events.length === 0 && day.meetings.length === 0).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Haftalik</div>
          <h1 className="display mt-3 text-[34px] leading-tight sm:text-[42px]">Bu hafta</h1>
          <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-[color:var(--color-muted)]">
            {formatDate(from, "d MMMM")} — {formatDate(addDays(from, 6), "d MMMM")}: {events.length} tadbir va
            doimiy uchrashuvlar. Sahifani Telegramga ulashib yuborish mumkin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton title="TDIU klublari — bu hafta" text="Kelasi yetti kunda klublarda nima bo‘ladi" href="/haftalik" compact />
          <Link href="/api/calendar.ics" className="btn btn-secondary btn-sm">
            <CalendarDays size={14} /> Taqvimga obuna
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
        <aside className="h-fit rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
            Hafta xulosasi
          </p>
          <dl className="mt-3 space-y-2.5 text-[13px]">
            <div className="flex items-baseline justify-between">
              <dt className="text-[color:var(--color-muted)]">Tadbirlar</dt>
              <dd className="font-semibold tabular-nums text-[color:var(--color-ink)]">{events.length}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[color:var(--color-muted)]">Ishtirokchilar</dt>
              <dd className="font-semibold tabular-nums text-[color:var(--color-ink)]">
                {events.reduce((sum, event) => sum + event._count.rsvps, 0)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[color:var(--color-muted)]">Faol kunlar</dt>
              <dd className="font-semibold tabular-nums text-[color:var(--color-ink)]">{7 - quiet}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-[9px] bg-[color:var(--color-surface-2)] p-3 text-[11.5px] leading-relaxed text-[color:var(--color-muted)]">
            Taqvimga obuna bo‘lsangiz, yangi tadbirlar telefoningizdagi kalendarga o‘zi qo‘shiladi.
          </p>
        </aside>

        <div className="space-y-7">
          {days.map((day) => {
            const empty = day.events.length === 0 && day.meetings.length === 0;
            const today = day.date.getTime() === from.getTime();
            return (
              <section key={day.date.toISOString()} className="reveal">
                <div className="flex items-baseline gap-3 border-b border-[color:var(--color-line)] pb-2">
                  <h2 className="font-serif text-[19px] leading-none text-[color:var(--color-ink)]">
                    {formatDate(day.date, "d MMM")}
                  </h2>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                    {day.dayName}
                  </span>
                  {today && (
                    <span className="rounded-full bg-[color:color-mix(in_oklab,var(--color-green)_14%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-green)]">
                      Bugun
                    </span>
                  )}
                  <span className="ml-auto text-[11px] tabular-nums text-[color:var(--color-muted-soft)]">
                    {day.events.length + day.meetings.length}
                  </span>
                </div>

                {empty ? (
                  <p className="py-3 text-[12.5px] text-[color:var(--color-muted-soft)]">
                    Bu kunda rejalashtirilgan uchrashuv yo‘q.
                  </p>
                ) : (
                  <div className="divide-y divide-[color:var(--color-line)]">
                    {day.events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="group flex items-start gap-3 py-3 transition-colors hover:bg-[color:var(--color-surface-2)]"
                      >
                        <span className="w-11 shrink-0 pt-0.5 text-[11.5px] tabular-nums text-[color:var(--color-muted)]">
                          {timeRange(event.startsAt, event.endsAt).split("–")[0]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: event.club.accent }} />
                            {event.club.name}
                          </span>
                          <span className="mt-1 block text-[14px] font-medium leading-snug text-[color:var(--color-ink)] transition-colors group-hover:text-[color:var(--color-link)]">
                            {event.title}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-3 text-[11.5px] text-[color:var(--color-muted)]">
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={11} /> {event.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users size={11} /> {event._count.rsvps}
                              {event.capacity ? ` / ${event.capacity}` : ""}
                            </span>
                          </span>
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="mt-1 shrink-0 text-[color:var(--color-muted-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    ))}

                    {day.meetings.map((club) => (
                      <Link
                        key={`meeting-${club.slug}`}
                        href={`/clubs/${club.slug}`}
                        className="group flex items-start gap-3 py-3 transition-colors hover:bg-[color:var(--color-surface-2)]"
                      >
                        <span className="w-11 shrink-0 pt-0.5 text-[11.5px] tabular-nums text-[color:var(--color-muted)]">
                          {club.meetingTime?.split("–")[0] ?? "—"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                            Doimiy uchrashuv
                          </span>
                          <span className="mt-1 block text-[13.5px] leading-snug text-[color:var(--color-ink-soft)] transition-colors group-hover:text-[color:var(--color-link)]">
                            {club.name}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
