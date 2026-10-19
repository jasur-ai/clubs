import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Send,
  Smartphone,
  Users,
  MapPin,
} from "lucide-react";
import { ClubCard, EventRow, EventTile, NewsCard } from "@/components/site/cards";
import { BookCard } from "@/components/site/cards";
import { CoverArt } from "@/components/ui/cover-art";
import { ArrowLink, Badge, ProgressBar, SectionHeading, Stat } from "@/components/ui/primitives";
import { formatDate, relativeDate, timeRange } from "@/lib/format";
import {
  getClubs,
  getCommunityProgress,
  getCurrentCycle,
  getLatestNews,
  getUpcomingEvents,
} from "@/lib/queries";
import { db } from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  const clubs = await getClubs();
  const bookClub = clubs.find((c) => c.slug === "book-club");
  const [events, news, cycle, community] = await Promise.all([
    getUpcomingEvents({ limit: 3 }),
    getLatestNews({ limit: 3 }),
    bookClub ? getCurrentCycle(bookClub.id) : null,
    bookClub ? getCommunityProgress(bookClub.id) : { average: 0, readers: 0 },
  ]);

  const [memberCount, eventCount, bookCount] = await Promise.all([
    db.membership.count({ where: { status: "ACTIVE" } }),
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.book.count(),
  ]);

  const nextEvent = events[0];

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b border-[color:var(--color-line)] bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(32,112,208,0.10),transparent_62%)]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:py-20">
          <div className="rise">
            <div className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2070d0]" />
              TDIU · Yoshlar tashabbuslari
            </div>
            <h1 className="display mt-4 text-[40px] leading-[1.02] text-[color:var(--color-ink)] sm:text-[56px] lg:text-[62px]">
              Universitet hayoti —<br />
              bir platformada.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[color:var(--color-muted)]">
              {clubs.length} ta klub, kitobxonlik dasturi va tadbirlar. Veb-sayt, Telegram bot va mini-ilova — bitta
              hisob bilan.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/clubs" className="btn btn-primary btn-lg">
                Klublarni ko‘rish
              </Link>
              <Link href="/join" className="btn btn-secondary btn-lg">
                A’zo bo‘lish
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[color:var(--color-line)] pt-6">
              <HeroStat value={clubs.length} label="klub" />
              <HeroStat value={6} label="yo‘nalish" />
              <HeroStat value={eventCount} label="tadbir" />
              <HeroStat value={bookCount} label="kitob" />
            </dl>
          </div>

          {/* live panel */}
          <div className="rise space-y-3 [animation-delay:120ms]">
            {cycle ? (
              <div
                className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]"
                style={{ "--club-accent": bookClub?.accent ?? "#a8492f" } as React.CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Hozir o‘qilmoqda</span>
                  <Link href="/clubs/book-club" className="text-[11px] font-semibold text-[color:var(--color-muted)] hover:text-[color:var(--club-accent)]">
                    Book Club
                  </Link>
                </div>
                <div className="mt-4 flex gap-4">
                  <CoverArt
                    from={cycle.book.coverFrom}
                    to={cycle.book.coverTo}
                    title={cycle.book.title}
                    author={cycle.book.author}
                    variant="lines"
                    compact
                    className="h-[124px] w-[88px] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-[21px] leading-tight text-[color:var(--color-ink)]">{cycle.book.title}</h2>
                    <p className="mt-1 text-[13px] text-[color:var(--color-muted)]">{cycle.book.author}</p>
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between text-[11px] text-[color:var(--color-muted)]">
                        <span>Hamjamiyat progressi</span>
                        <span className="font-semibold text-[color:var(--color-ink)]">{community.average}%</span>
                      </div>
                      <ProgressBar value={community.average} />
                    </div>
                    <p className="mt-3 text-[11.5px] text-[color:var(--color-muted)]">
                      {community.readers} o‘quvchi · {cycle.milestones.length} bosqich
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-[10px] bg-[#f8f9fb] px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
                      Yakuniy uchrashuv
                    </p>
                    <p className="mt-1 truncate text-[13px] font-medium text-[color:var(--color-ink)]">
                      {cycle.meetingAt ? formatDate(cycle.meetingAt, "d MMMM, HH:mm") : "Belgilanmagan"}
                    </p>
                  </div>
                  <Link href="/clubs/book-club" className="btn btn-accent btn-sm">
                    Davom etish
                  </Link>
                </div>
              </div>
            ) : null}

            {nextEvent ? (
              <div className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Keyingi tadbir</span>
                  <Badge tone="neutral">{relativeDate(nextEvent.startsAt)}</Badge>
                </div>
                <h3 className="mt-3 line-clamp-1 font-serif text-[19px] text-[color:var(--color-ink)]">{nextEvent.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-[color:var(--color-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} /> {formatDate(nextEvent.startsAt, "d MMMM")} ·{" "}
                    {timeRange(nextEvent.startsAt, nextEvent.endsAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} /> {nextEvent.location}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ ecosystem */}
      <section className="border-b border-[color:var(--color-line)] bg-[#fbfcfd]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-x divide-[color:var(--color-line)] px-4 sm:px-6 lg:grid-cols-4">
          <EcoItem icon={<LayoutDashboard size={16} />} title="Veb-sayt" text="Klublar, yangiliklar, tadbirlar" />
          <EcoItem icon={<Send size={16} />} title="Telegram bot" text="Eslatmalar va tezkor kirish" />
          <EcoItem icon={<Smartphone size={16} />} title="Mini-ilova" text="O‘qish va RSVP — telefondan" />
          <EcoItem icon={<Users size={16} />} title="Admin panel" text="A’zolar, kontent, statistika" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- clubs */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Klublar"
          title="O‘zingizni toping"
          description="Intellektual o‘yinlardan kibersportgacha — har bir yo‘nalishda faol jamoa."
          action={<ArrowLink href="/clubs">Barcha {clubs.length} klub</ArrowLink>}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.slice(0, 6).map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- reading */}
      <section className="relative overflow-hidden bg-[#0b1f33] text-white">
        <div aria-hidden className="absolute inset-0 opacity-[0.07] grid-paper" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <span className="eyebrow !text-white/55">Kitobxonlik dasturi</span>
            <h2 className="display mt-3 text-[32px] text-white sm:text-[40px]">
              Bir kitob —<br />
              butun universitet.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              Har oy yangi asar, bosqichma-bosqich o‘qish va ochiq muhokama. Bookonomics loyihasi klubning yadrosi.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-6">
              <div>
                <div className="font-serif text-2xl">{community.readers}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/50">o‘quvchi</div>
              </div>
              <div>
                <div className="font-serif text-2xl">{community.average}%</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/50">o‘rtacha</div>
              </div>
              <div>
                <div className="font-serif text-2xl">{bookCount}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/50">kutubxonada</div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/clubs/book-club" className="btn btn-lg bg-white text-[#0b1f33] hover:bg-white/90">
                Book Club
              </Link>
              <Link href="/books" className="btn btn-lg border border-white/25 text-white hover:bg-white/10">
                Kutubxona
              </Link>
            </div>
          </div>

          {cycle && (
            <div className="rounded-[16px] border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">Joriy o‘qish</span>
                <span className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-semibold">Bookonomics</span>
              </div>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row">
                <CoverArt
                  from={cycle.book.coverFrom}
                  to={cycle.book.coverTo}
                  title={cycle.book.title}
                  author={cycle.book.author}
                  variant="lines"
                  compact
                  className="h-[168px] w-[118px] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-[24px] leading-tight">{cycle.book.title}</h3>
                  <p className="mt-1 text-[13px] text-white/60">
                    {cycle.book.author}
                    {cycle.book.year ? ` · ${cycle.book.year}` : ""}
                  </p>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-white/70">{cycle.book.description}</p>
                  <div className="mt-4 space-y-2.5">
                    {cycle.milestones.slice(0, 3).map((m, i) => {
                      const done = community.average >= ((i + 1) / Math.max(cycle.milestones.length, 1)) * 100;
                      return (
                        <div key={m.id} className="flex items-center justify-between gap-3 text-[12px]">
                          <span className="flex items-center gap-2 text-white/80">
                            <span
                              className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] ${
                                done ? "border-white bg-white text-[#0b1f33]" : "border-white/30 text-transparent"
                              }`}
                              aria-hidden
                            >
                              ✓
                            </span>
                            {m.title}
                          </span>
                          <span className="shrink-0 text-white/45">{formatDate(m.dueAt, "d MMM")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------------- events */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Tadbirlar"
          title="Yaqin kunlarda"
          description="Shanba — klublar kuni. Ro‘yxatdan o‘tish bir tugma bilan."
          action={<ArrowLink href="/events">Tadbirlar taqvimi</ArrowLink>}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            {events.slice(0, 2).map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
            {events.length === 0 && <p className="text-sm text-[color:var(--color-muted)]">Hozircha tadbir yo‘q.</p>}
          </div>
          {events[2] && (
            <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-4">
              <EventTile event={events[2]} />
            </div>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------------- news */}
      <section className="border-y border-[color:var(--color-line)] bg-[#fbfcfd]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Yangiliklar"
            title="Klub hayoti"
            action={<ArrowLink href="/news">Barcha yangiliklar</ArrowLink>}
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {news[0] && <NewsCard item={news[0]} featured />}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {news.slice(1, 3).map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- books */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Kutubxona"
          title="Ijtimoiy faollik indeksi ro‘yxati"
          description="Vazirlikning 186-son buyrug‘i bo‘yicha 12 ta asar. Klub bo‘yicha tayyorgarlik sessiyalari."
          action={<ArrowLink href="/books">Barcha kitoblar</ArrowLink>}
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(await db.book.findMany({ orderBy: { createdAt: "asc" }, take: 6 })).map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ cta */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[18px] border border-[color:var(--color-line)] bg-white">
          <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(120deg,transparent,rgba(16,64,112,0.05))]" />
          <div className="relative flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <div className="eyebrow">Yoshlar ittifoqi</div>
              <h2 className="display mt-2 text-[26px] sm:text-[32px]">Jamoaga qo‘shiling</h2>
              <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-[color:var(--color-muted)]">
                Ariza bir daqiqada. Klub rahbari Telegram orqali javob beradi.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/join" className="btn btn-primary btn-lg">
                A’zo bo‘lish <ArrowRight size={16} />
              </Link>
              <a href="https://t.me/tsuebookclub" target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
                <Send size={15} /> Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-serif text-[26px] leading-none text-[color:var(--color-ink)]">
        {value}
        <span className="ml-1.5 text-[12px] font-sans font-medium uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
          {label}
        </span>
      </dd>
    </div>
  );
}

function EcoItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-5 first:pl-0 sm:px-6">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[color:var(--color-line)] bg-white text-[#104070]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[color:var(--color-ink)]">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-[color:var(--color-muted)]">{text}</p>
      </div>
    </div>
  );
}
