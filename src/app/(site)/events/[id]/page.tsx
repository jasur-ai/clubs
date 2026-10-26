import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, CalendarPlus, Clock, MapPin, Navigation, Users } from "lucide-react";
import { CoverArt } from "@/components/ui/cover-art";
import { Badge, ProgressBar } from "@/components/ui/primitives";
import { ClubLogo } from "@/components/ui/club-logo";
import { SaveButton } from "@/components/site/save-button";
import { ShareButton } from "@/components/site/share-button";
import { formatDate, timeRange } from "@/lib/format";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { rsvpAction } from "@/app/actions/member";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: { club: { select: { name: true } } },
  });
  if (!event) return { title: "Tadbir topilmadi" };
  const card = `/api/og?title=${encodeURIComponent(event.title)}&eyebrow=${encodeURIComponent(event.club.name)}&meta=${encodeURIComponent(formatDate(event.startsAt, "d MMM · HH:mm") + " · " + event.location)}`;
  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      type: "article",
      images: [{ url: card, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: event.title, description: event.description, images: [card] },
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      club: { select: { id: true, name: true, slug: true, accent: true, telegramUrl: true, logoUrl: true } },
      rsvps: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, take: 12 },
      _count: { select: { rsvps: true } },
    },
  });
  if (!event) notFound();

  const alsoUpcoming = await db.event.findMany({
    where: {
      clubId: event.club.id,
      id: { not: event.id },
      status: "PUBLISHED",
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
    take: 3,
    select: { id: true, title: true, startsAt: true, location: true },
  });

  const user = await getSession();
  const mine = user ? event.rsvps.find((r) => r.userId === user.id) : null;
  const isPast = event.startsAt < new Date();
  const fill = event.capacity ? Math.min(100, Math.round((event._count.rsvps / event.capacity) * 100)) : null;
  const seatsLeft = event.capacity ? Math.max(0, event.capacity - event._count.rsvps) : null;
  const isFull = seatsLeft === 0;

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
            <Badge tone={isPast ? "neutral" : isFull ? "warning" : "success"}>
              {isPast ? "Yakunlangan" : isFull ? "Joylar to‘ldi" : "Ochiq"}
            </Badge>
          </div>
          <h1 className="display mt-4 text-[36px] leading-tight sm:text-[44px]">{event.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-[color:var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} /> {formatDate(event.startsAt, "d MMMM, EEEE")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} /> {timeRange(event.startsAt, event.endsAt)}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`TDIU ${event.location}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--color-link)]"
              title="Xaritada ochish"
            >
              <MapPin size={14} /> {event.location}
              <Navigation size={12} className="text-[color:var(--color-muted-soft)]" />
            </a>
          </div>
          <p className="prose-editorial mt-6 whitespace-pre-line">{event.description}</p>

          {/* organiser */}
          <div className="mt-8 flex items-center gap-3 rounded-[13px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4">
            <ClubLogo name={event.club.name} logoUrl={event.club.logoUrl} accent={event.club.accent} size={38} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                Tashkilotchi
              </p>
              <Link
                href={`/clubs/${event.club.slug}`}
                className="block truncate text-[13.5px] font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-link)]"
              >
                {event.club.name}
              </Link>
            </div>
            <Link href={`/clubs/${event.club.slug}`} className="btn btn-ghost btn-sm">
              Klub sahifasi <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* keep the page useful after the announcement: what else is coming */}
          {alsoUpcoming.length > 0 && (
            <div className="mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                Klubda keyin
              </p>
              <div className="mt-3 border-t border-[color:var(--color-line)]">
                {alsoUpcoming.map((item) => (
                  <Link
                    key={item.id}
                    href={`/events/${item.id}`}
                    className="group flex items-center gap-4 border-b border-[color:var(--color-line)] py-3 transition-colors hover:text-[color:var(--color-link)]"
                  >
                    <span className="w-12 shrink-0 text-[12px] font-semibold tabular-nums text-[color:var(--color-muted)]">
                      {formatDate(item.startsAt, "d MMM")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-[color:var(--color-ink)]">
                      {item.title}
                    </span>
                    <span className="hidden shrink-0 text-[11.5px] text-[color:var(--color-muted)] sm:block">{item.location}</span>
                    <ArrowUpRight size={14} className="shrink-0 text-[color:var(--color-muted-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}
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
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <SaveButton
                kind="event"
                id={event.id}
                title={event.title}
                meta={`${formatDate(event.startsAt, "d MMM · HH:mm")} · ${event.location}`}
                href={`/events/${event.id}`}
                className="save-btn-compact"
              />
              <ShareButton title={event.title} text={event.description} path={`/events/${event.id}`} compact className="save-btn-compact" />
            </div>
            {!isPast && seatsLeft !== null && seatsLeft > 0 && seatsLeft <= 8 && (
              <p className="text-center text-[11.5px] font-medium text-[color:var(--color-warning)]">
                Oxirgi {seatsLeft} joy qoldi
              </p>
            )}
            <a
              href={`/api/events/${event.id}/ics`}
              className="btn btn-secondary w-full"
              download
            >
              <CalendarPlus size={15} /> Taqvimga qo‘shish
            </a>
            {event.club.telegramUrl && (
              <a href={event.club.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-ghost w-full">
                Klub kanali
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
