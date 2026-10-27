import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { CalendarSubscribe } from "@/components/site/calendar-subscribe";
import { getPastEvents, getUpcomingEvents } from "@/lib/queries";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { formatDate, timeRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tadbirlar",
  description: "TDIU klublari tadbirlari taqvimi: uchrashuvlar, tanlovlar, sayohatlar va sport musobaqalari.",
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ club?: string }> }) {
  const params = await searchParams;
  const clubs = await db.club.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });
  const selected = clubs.find((c) => c.slug === params.club);

  const club = selected ? await db.club.findUnique({ where: { slug: selected.slug }, select: { id: true } }) : null;
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents({ limit: 30, clubId: club?.id }),
    getPastEvents({ limit: 6, clubId: club?.id }),
  ]);

  // Group by Tashkent day: an agenda is read as "what happens on which day",
  // not as a list of cards. The date is printed once, then its events.
  const days = new Map<string, typeof upcoming>();
  upcoming.forEach((e) => {
    const key = formatDate(e.startsAt, "yyyy-MM-dd");
    const bucket = days.get(key) ?? [];
    bucket.push(e);
    days.set(key, bucket);
  });

  return (
    <div className="bg-[color:var(--color-paper)]">
      <div className="gz-wrap">
        <div className="grid gap-8 pb-9 pt-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:gap-14">
          <div className="min-w-0">
            <span className="gz-kicker">Taqvim · {upcoming.length} tadbir</span>
            <h1 className="gz-display mt-4 !text-[clamp(40px,6vw,86px)]">Tadbirlar</h1>
            <p className="gz-lede mt-5">
              Barcha klublar tadbirlari bir joyda — kun bo‘yicha. RSVP qilish uchun hisobingizga kiring.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-[color:var(--color-ink)] pt-4 lg:justify-end lg:border-t-0 lg:border-l lg:border-[color:var(--color-line)] lg:pl-8 lg:pt-0">
            <Link href="/haftalik" className="gz-link text-[13px] font-semibold">
              Bu hafta
            </Link>
            <CalendarSubscribe club={params.club} compact />
          </div>
        </div>
      </div>

      <div className="border-y border-[color:var(--color-line)] bg-[color:var(--color-surface-2)]">
        <div className="gz-wrap py-3">
          <div className="hide-scrollbar flex items-baseline gap-x-4 overflow-x-auto">
            <Chip href="/events" label="Barchasi" active={!params.club} />
            {clubs.map((c) => (
              <Chip key={c.slug} href={`/events?club=${c.slug}`} label={c.name} active={params.club === c.slug} />
            ))}
          </div>
        </div>
      </div>

      <div className="gz-wrap grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_268px] lg:gap-14">
        {/* the agenda */}
        <div className="min-w-0">
          {upcoming.length === 0 ? (
            <p className="border-t border-[color:var(--color-ink)] py-12 text-center text-[13px] text-[color:var(--color-muted)]">
              Bu klub uchun hozircha rejalashtirilgan tadbir yo‘q.
            </p>
          ) : (
            <div className="border-t border-[color:var(--color-ink)]">
              {[...days.entries()].map(([key, items]) => {
                const first = items[0];
                return (
                  <section key={key} className="grid grid-cols-[64px_minmax(0,1fr)] gap-5 border-b border-[color:var(--color-line)] py-5">
                    <div className="gz-date items-start">
                      <span className="gz-date__day !text-[32px]">{formatDate(first.startsAt, "d")}</span>
                      <span className="gz-date__month">{formatDate(first.startsAt, "MMMM")}</span>
                      <span className="mt-1 text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--color-muted-soft)]">
                        {formatDate(first.startsAt, "EEEE")}
                      </span>
                    </div>

                    <div className="min-w-0 divide-y divide-[color:var(--color-line)]">
                      {items.map((e) => (
                        <Link
                          key={e.id}
                          href={`/events/${e.id}`}
                          className="group block py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-baseline gap-2.5">
                            <span aria-hidden className="h-1 w-1 shrink-0 rounded-full" style={{ background: e.club.accent }} />
                            <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                              {e.club.name}
                            </span>
                          </div>
                          <h2 className="mt-1 font-serif text-[20px] leading-tight text-[color:var(--color-ink)] decoration-[color:var(--color-brass-line)] decoration-1 underline-offset-[5px] group-hover:underline">
                            {e.title}
                          </h2>
                          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
                            {e.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[color:var(--color-muted)]">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={11} /> {timeRange(e.startsAt, e.endsAt)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={11} /> {e.location}
                            </span>
                            {typeof e._count?.rsvps === "number" && (
                              <span className="inline-flex items-center gap-1.5 font-variant-numeric tabular-nums">
                                <Users size={11} /> {e._count.rsvps}
                                {e.capacity ? `/${e.capacity}` : ""}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* the margin column */}
        <aside className="min-w-0 lg:border-l lg:border-[color:var(--color-line)] lg:pl-10">
          <h2 className="gz-kicker">O‘tgan tadbirlar</h2>
          <ul className="mt-3 border-t border-[color:var(--color-ink)]">
            {past.slice(0, 6).map((e) => (
              <li key={e.id} className="border-b border-[color:var(--color-line)]">
                <Link href={`/events/${e.id}`} className="group block py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                    {formatDate(e.startsAt, "d MMM")} · {e.club.name}
                  </span>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[color:var(--color-ink)] group-hover:underline group-hover:underline-offset-4">
                    {e.title}
                  </p>
                </Link>
              </li>
            ))}
            {past.length === 0 && <li className="py-3 text-[13px] text-[color:var(--color-muted)]">Hozircha bo‘sh.</li>}
          </ul>

          <div className="mt-7 border-t border-[color:var(--color-line)] pt-4">
            <h2 className="gz-kicker">Eslatmalar</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
              Telegram bot har bir tadbirdan 24 soat oldin eslatadi — kanalga obuna bo‘lganlarga ham.
            </p>
            <a href="https://t.me/Tsue_clubs_bot" target="_blank" rel="noreferrer" className="gz-btn mt-4 !px-3.5 !py-2 !text-[12px]">
              Botni ochish
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={cn(
        "group relative shrink-0 whitespace-nowrap pb-1 text-[12px] font-semibold transition-colors",
        active ? "text-[color:var(--color-ink)]" : "text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]",
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px origin-left bg-[color:var(--color-ink)] transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}
