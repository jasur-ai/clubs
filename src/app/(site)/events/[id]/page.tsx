import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CalendarPlus, Clock, ListOrdered, MapPin, Star, Users } from "lucide-react";
import { CoverArt } from "@/components/ui/cover-art";
import { Badge, ProgressBar } from "@/components/ui/primitives";
import { SaveButton } from "@/components/site/save-button";
import { ShareButton } from "@/components/site/share-button";
import { submitFeedbackAction } from "@/app/actions/member";
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
      rsvps: {
        where: { status: { in: ["GOING", "MAYBE"] } },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
        take: 24,
      },
      feedback: { select: { rating: true, comment: true, userId: true, createdAt: true } },
      _count: { select: { rsvps: true } },
    },
  });
  if (!event) notFound();

  const user = await getSession();
  const mine = user
    ? await db.eventRsvp.findUnique({ where: { eventId_userId: { eventId: event.id, userId: user.id } } })
    : null;
  const waitlist = await db.eventRsvp.findMany({
    where: { eventId: event.id, status: "WAITLIST" },
    orderBy: { createdAt: "asc" },
    select: { userId: true },
  });
  const going = event.rsvps.filter((rsvp) => rsvp.status === "GOING").length;
  const isPast = event.startsAt < new Date();
  const fill = event.capacity ? Math.min(100, Math.round((going / event.capacity) * 100)) : null;
  const queuePosition = mine?.status === "WAITLIST" ? waitlist.findIndex((row) => row.userId === user?.id) + 1 : 0;
  const ratingAvg = event.feedback.length
    ? Math.round((event.feedback.reduce((sum, row) => sum + row.rating, 0) / event.feedback.length) * 10) / 10
    : null;
  const myFeedback = user ? event.feedback.find((row) => row.userId === user.id) : null;

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
                <Users size={14} /> {going}
                {event.capacity ? ` / ${event.capacity}` : ""}
                {waitlist.length > 0 && (
                  <span className="ml-1 rounded-full bg-[color:var(--color-warning-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-warning)]">
                    +{waitlist.length} navbat
                  </span>
                )}
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
                        {event.capacity && going >= event.capacity && mine?.status !== "GOING" ? "Navbatga" : "Boraman"}
                      </button>
                      <button name="status" value="MAYBE" className={`btn btn-sm ${mine?.status === "MAYBE" ? "btn-accent" : "btn-secondary"}`}>
                        Ehtimol
                      </button>
                      <button name="status" value="CANCELLED" className={`btn btn-sm ${mine?.status === "CANCELLED" ? "btn-accent" : "btn-secondary"}`}>
                        Yo‘q
                      </button>
                    </div>
                    {mine && (
                      <p className="flex items-center justify-center gap-1.5 text-center text-[11.5px] text-[color:var(--color-muted)]">
                        {mine.status === "WAITLIST" ? (
                          <>
                            <ListOrdered size={12} /> Navbatdasiz{queuePosition > 0 ? ` · ${queuePosition}-o‘rin` : ""} —
                            joy bo‘shasa xabar beramiz
                          </>
                        ) : (
                          <>Javobingiz: {mine.status === "GOING" ? "boraman" : mine.status === "MAYBE" ? "ehtimol" : "bormayman"}</>
                        )}
                      </p>
                    )}
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
            <SaveButton
              kind="event"
              id={event.id}
              title={event.title}
              meta={`${formatDate(event.startsAt, "d MMM · HH:mm")} · ${event.location}`}
              href={`/events/${event.id}`}
            />
            <a
              href={`/api/events/${event.id}/ics`}
              className="btn btn-secondary w-full"
              download
            >
              <CalendarPlus size={15} /> Taqvimga qo‘shish
            </a>
            <div className="grid grid-cols-2 gap-2">
              <ShareButton
                title={event.title}
                text={`${event.title} · ${formatDate(event.startsAt, "d MMM, HH:mm")}`}
                href={`/events/${event.id}`}
                className="btn btn-secondary btn-sm w-full justify-center"
              />
              {event.club.telegramUrl ? (
                <a
                  href={event.club.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm w-full justify-center"
                >
                  Klub kanali
                </a>
              ) : (
                <Link href={`/clubs/${event.club.slug}`} className="btn btn-ghost btn-sm w-full justify-center">
                  Klub sahifasi
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* -------------------------------------------------------------- feedback */}
      {isPast && (
        <section className="mt-12 border-t border-[color:var(--color-line)] pt-8">
          <div className="grid gap-8 lg:grid-cols-[0.45fr_0.55fr]">
            <div>
              <p className="eyebrow">Baholash</p>
              <h2 className="display mt-2 text-[26px] leading-tight">Tadbir qanday o‘tdi?</h2>
              <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-[color:var(--color-muted)]">
                Baho klubning reytingiga qo‘shiladi va keyingi tadbirlarni rejalashda ishlatiladi.
                {ratingAvg !== null && (
                  <>
                    {" "}
                    Hozirgi o‘rtacha:{" "}
                    <span className="font-semibold text-[color:var(--color-brass)]">★ {ratingAvg}</span>{" "}
                    ({event.feedback.length} baho).
                  </>
                )}
              </p>
            </div>

            <div>
              {user ? (
                <form action={submitFeedbackAction} className="rounded-[13px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4">
                  <input type="hidden" name="eventId" value={event.id} />
                  <fieldset>
                    <legend className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      Baho
                    </legend>
                    <div className="mt-2 flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value} className="group cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            value={value}
                            required
                            defaultChecked={myFeedback?.rating === value}
                            className="peer sr-only"
                          />
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[color:var(--color-line)] text-[color:var(--color-muted-soft)] transition-all peer-checked:border-[color:var(--color-brass)] peer-checked:bg-[color:var(--color-warning-bg)] peer-checked:text-[color:var(--color-brass)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[color:var(--color-green)] hover:border-[color:var(--color-line-strong)]">
                            <Star size={15} strokeWidth={1.9} />
                          </span>
                          <span className="sr-only">{value} yulduz</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <textarea
                    name="comment"
                    rows={3}
                    defaultValue={myFeedback?.comment ?? ""}
                    placeholder="Qisqa izoh (ixtiyoriy)"
                    className="textarea mt-3 w-full"
                    maxLength={400}
                  />
                  <button className="btn btn-primary btn-sm mt-3 w-full">
                    {myFeedback ? "Bahoni yangilash" : "Yuborish"}
                  </button>
                </form>
              ) : (
                <div className="rounded-[13px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5 text-center">
                  <p className="text-[13px] text-[color:var(--color-muted)]">Baholash uchun hisobingizga kiring.</p>
                  <Link href={`/login?next=/events/${event.id}`} className="btn btn-secondary btn-sm mt-3">
                    Kirish
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
