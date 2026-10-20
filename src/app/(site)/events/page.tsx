import type { Metadata } from "next";
import Link from "next/link";
import { EventRow } from "@/components/site/cards";
import { SectionHeading } from "@/components/ui/primitives";
import { getPastEvents, getUpcomingEvents } from "@/lib/queries";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tadbirlar",
  description: "TDIU klublari tadbirlari taqvimi: uchrashuvlar, tanlovlar, sayohatlar va sport musobaqalari.",
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ club?: string }> }) {
  const params = await searchParams;
  const clubs = await db.club.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } });
  const selected = clubs.find((c) => c.slug === params.club);

  const club = selected ? await db.club.findUnique({ where: { slug: selected.slug }, select: { id: true } }) : null;
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents({ limit: 30, clubId: club?.id }),
    getPastEvents({ limit: 6, clubId: club?.id }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionHeading
        eyebrow="Taqvim"
        title="Tadbirlar"
        description="Barcha klublar tadbirlari bir joyda. RSVP qilish uchun hisobingizga kiring."
      />

      <div className="hide-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-[color:var(--color-line)] pb-5">
        <Chip href="/events" label="Barchasi" active={!params.club} />
        {clubs.map((c) => (
          <Chip key={c.slug} href={`/events?club=${c.slug}`} label={c.name} active={params.club === c.slug} />
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-3">
          {upcoming.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
          {upcoming.length === 0 && (
            <p className="rounded-[14px] border border-dashed border-[color:var(--color-line-strong)] bg-white p-8 text-center text-sm text-[color:var(--color-muted)]">
              Bu klub uchun hozircha rejalashtirilgan tadbir yo‘q.
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">O‘tgan tadbirlar</h2>
            <div className="mt-4 space-y-3">
              {past.slice(0, 5).map((e) => (
                <Link key={e.id} href={`/events/${e.id}`} className="block border-b border-[color:var(--color-line)] pb-3 last:border-0 last:pb-0">
                  <p className="line-clamp-2 text-[13px] font-medium text-[color:var(--color-ink)]">{e.title}</p>
                  <p className="mt-1 text-[11.5px] text-[color:var(--color-muted)]">
                    {new Date(e.startsAt).toLocaleDateString("uz-UZ", { day: "numeric", month: "long" })} · {e.club.name}
                  </p>
                </Link>
              ))}
              {past.length === 0 && <p className="text-[13px] text-[color:var(--color-muted)]">Hozircha bo‘sh.</p>}
            </div>
          </div>
          <div className="rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-plate)] p-5 text-white">
            <h2 className="font-serif text-[19px]">Eslatmalar</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
              Telegram bot orqali tadbir eslatmalarini oling — har bir tadbirdan 24 soat oldin.
            </p>
            <a href="https://t.me/tsuebookclub" target="_blank" rel="noreferrer" className="btn btn-sm mt-4 bg-white text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface)]/90">
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
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold",
        active ? "border-[#104070] bg-[color:var(--color-navy)] text-white" : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)]",
      )}
    >
      {label}
    </Link>
  );
}
