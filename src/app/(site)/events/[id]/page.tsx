import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { CoverArt } from "@/components/ui/cover-art";
import { Badge, ProgressBar } from "@/components/ui/primitives";
import { formatDate, timeRange } from "@/lib/format";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { rsvpAction } from "@/app/actions/member";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  return event ? { title: event.title, description: event.description } : { title: "Tadbir topilmadi" };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      club: { select: { name: true, slug: true, accent: true, telegramUrl: true } },
      rsvps: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, take: 12 },
      _count: { select: { rsvps: true } },
    },
  });
  if (!event) notFound();

  const user = await getSession();
  const mine = user ? event.rsvps.find((r) => r.userId === user.id) : null;
  const isPast = event.startsAt < new Date();
  const fill = event.capacity ? Math.min(100, Math.round((event._count.rsvps / event.capacity) * 100)) : null;

  return (
    <div style={{ "--club-accent": event.club.accent } as React.CSSProperties} className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <nav className="text-[12px] text-[color:var(--color-muted)]">
        <Link href="/events" className="hover:text-[color:var(--color-ink)]">Tadbirlar</Link>
        <span className="mx-2">/</span>
        <Link href={`/clubs/${event.club.slug}`} className="hover:text-[color:var(--color-ink)]">{event.club.name}</Link>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{event.club.name}</Badge>
            <Badge tone={isPast ? "neutral" : "success"}>{isPast ? "Yakunlangan" : "Ochiq"}</Badge>
          </div>
          <h1 className="display mt-4 text-[36px] leading-tight sm:text-[44px]">{event.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-[color:var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} /> {formatDate(event.startsAt, "d MMMM, EEEE")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} /> {timeRange(event.startsAt, event.endsAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {event.location}
            </span>
          </div>
          <p className="prose-editorial mt-6 whitespace-pre-line">{event.description}</p>
        </div>

        <aside className="space-y-4">
          <CoverArt from={event.coverFrom} to={event.coverTo} title={formatDate(event.startsAt, "d MMMM")} compact className="aspect-[16/10] w-full" />
          <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Ishtirok</span>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                <Users size={14} /> {event._count.rsvps}
                {event.capacity ? ` / ${event.capacity}` : ""}
              </span>
            </div>
            {fill !== null && <ProgressBar value={fill} className="mt-3" />}
            {!isPast && (
              <div className="mt-4">
                {!user ? (
                  <Link href={`/login?next=/events/${event.id}`} className="btn btn-accent w-full">
                    RSVP uchun kirish
                  </Link>
                ) : (
                  <form action={rsvpAction} className="space-y-2">
                    <input type="hidden" name="eventId" value={event.id} />
                    <div className="grid grid-cols-3 gap-2">
                      <button name="status" value="GOING" className={`btn btn-sm ${mine?.status === "GOING" ? "btn-accent" : "btn-secondary"}`}>
                        Boraman
                      </button>
                      <button name="status" value="MAYBE" className={`btn btn-sm ${mine?.status === "MAYBE" ? "btn-accent" : "btn-secondary"}`}>
                        Ehtimol
                      </button>
                      <button name="status" value="CANCELLED" className={`btn btn-sm ${mine?.status === "CANCELLED" ? "btn-accent" : "btn-secondary"}`}>
                        Yo‘q
                      </button>
                    </div>
                    {mine && <p className="text-center text-[11.5px] text-[color:var(--color-muted)]">Javobingiz: {mine.status === "GOING" ? "boraman" : mine.status === "MAYBE" ? "ehtimol" : "bormayman"}</p>}
                  </form>
                )}
              </div>
            )}
            {event.rsvps.length > 0 && (
              <div className="mt-4 border-t border-[color:var(--color-line)] pt-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">Qatnashuvchilar</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {event.rsvps.slice(0, 8).map((r) => (
                    <span key={r.id} className="rounded-full bg-[color:var(--color-surface-3)] px-2.5 py-1 text-[11.5px] text-[color:var(--color-ink-soft)]">
                      {r.user.firstName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {event.club.telegramUrl && (
            <a href={event.club.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-secondary w-full">
              Klub kanali
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
