import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Send,
  Smartphone,
  Users,
} from "lucide-react";
import { BookCard, NewsCard } from "@/components/site/cards";
import { CoverArt } from "@/components/ui/cover-art";
import { ClubLogo } from "@/components/ui/club-logo";
import { Badge, ProgressBar } from "@/components/ui/primitives";
import { YoshlarIttifoqiLockup } from "@/components/brand/marks";
import { Counter } from "@/components/site/motion";
import { CATEGORY_LABELS, type ClubCategory } from "@/config/clubs";
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

  const books = await db.book.findMany({ orderBy: { createdAt: "asc" }, take: 6 });

  const featured = bookClub ?? clubs[0];
  const rest = clubs.filter((c) => c.id !== featured?.id).slice(0, 3);
  const nextEvent = events[0];
  const categories = new Set(clubs.map((c) => c.category)).size;

  return (
    <>
      {/* ------------------------------------------------------------------ hero */}
      <section className="hero-shell grain relative border-b border-[color:var(--color-line)]">
        <div aria-hidden className="contour-field" />
        <div aria-hidden className="bloom-a -right-28 -top-32 h-[240px] w-[240px] opacity-70 drift sm:h-[420px] sm:w-[420px] sm:opacity-100" />
        <div aria-hidden className="bloom-b -left-52 bottom-[-200px] hidden h-[300px] w-[300px] opacity-70 sm:block" />

        <div className="relative mx-auto w-full max-w-[1180px] px-4 pb-8 pt-12 sm:px-6 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16">
            <div>
              <div className="rise eyebrow" style={{ "--delay": "40ms" } as React.CSSProperties}>
                O‘zbekiston Yoshlar ittifoqi · TDIU
              </div>

              <h1
                className="display rise mt-5 text-[44px] leading-[0.95] text-[color:var(--color-ink)] sm:text-[60px] lg:text-[68px]"
                style={{ "--delay": "110ms" } as React.CSSProperties}
              >
                <span className="block">Universitetdagi</span>
                <span className="block">har bir tashabbus</span>
                <span className="relative inline-block">
                  <em className="text-[color:var(--color-green)]">bir joyda.</em>
                </span>
              </h1>

              <p
                className="lede rise mt-7 max-w-[460px]"
                style={{ "--delay": "200ms" } as React.CSSProperties}
              >
                {clubs.length} yo‘nalishdagi talabalar klublari, tadbirlar taqvimi va Bookonomics
                kitobxonlik dasturi. Sayt, Telegram bot va mini-ilova — bitta hisob bilan.
              </p>

              <div
                className="rise mt-8 flex flex-wrap items-center gap-3"
                style={{ "--delay": "280ms" } as React.CSSProperties}
              >
                <Link href="/clubs" className="btn btn-primary btn-lg group">
                  Klub topish
                  <ArrowRight size={16} className="btn-arrow" />
                </Link>
                <Link href="/join" className="btn btn-secondary btn-lg group">
                  A’zo bo‘lish
                  <ArrowUpRight size={15} className="btn-arrow-up opacity-70" />
                </Link>
                <a
                  href="https://t.me/Tsue_clubs_bot/app"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden items-center gap-1.5 px-2 text-[13px] font-semibold text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)] sm:inline-flex"
                >
                  <Smartphone size={14} /> Mini-ilova
                </a>
              </div>

              <dl
                className="rise mt-11 grid grid-cols-2 gap-y-6 border-t border-[color:var(--color-line)] pt-6 sm:grid-cols-4"
                style={{ "--delay": "360ms" } as React.CSSProperties}
              >
                <HeroStat value={clubs.length} label="klub" />
                <HeroStat value={categories} label="yo‘nalish" />
                <HeroStat value={eventCount} label="tadbir" />
                <HeroStat value={memberCount} label="a’zo" />
              </dl>
            </div>

            {/* live panel */}
            <div className="relative rise [animation-delay:220ms]">
              {cycle ? (
                <div
                  className="relative overflow-hidden rounded-[20px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-pop)]"
                  style={{ "--club-accent": bookClub?.accent ?? "#a8492f" } as React.CSSProperties}
                >
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{ background: "var(--brand-gradient)" }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="eyebrow eyebrow-plain">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-green)] opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-green)]" />
                      </span>
                      Hozir o‘qilmoqda
                    </span>
                    <Link
                      href="/clubs/book-club"
                      className="text-[11px] font-semibold text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--club-accent-ink)]"
                    >
                      Book Club
                    </Link>
                  </div>

                  <div className="mt-5 flex gap-5">
                    <CoverArt
                      from={cycle.book.coverFrom}
                      to={cycle.book.coverTo}
                      title={cycle.book.title}
                      author={cycle.book.author}
                      variant="lines"
                      compact
                      className="h-[148px] w-[104px] shrink-0 shadow-[0_18px_30px_-18px_rgba(11,20,38,0.55)]"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif text-[24px] leading-[1.1] tracking-[-0.01em] text-[color:var(--color-ink)]">
                        {cycle.book.title}
                      </h2>
                      <p className="mt-1.5 text-[13px] text-[color:var(--color-muted)]">{cycle.book.author}</p>
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-[11px] text-[color:var(--color-muted)]">
                          <span>Hamjamiyat progressi</span>
                          <span className="font-semibold tabular-nums text-[color:var(--color-ink)]">
                            {community.average}%
                          </span>
                        </div>
                        <ProgressBar value={community.average} />
                      </div>
                      <p className="mt-3.5 text-[11.5px] text-[color:var(--color-muted)]">
                        {community.readers} o‘quvchi · {cycle.milestones.length} bosqich
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 rounded-[11px] bg-[color:var(--color-surface-2)] px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
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
                <div className="relative z-10 -mt-4 ml-4 mr-2 rounded-[16px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-lift)] sm:ml-12 lg:ml-16">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-[52px] w-[48px] shrink-0 flex-col items-center justify-center rounded-[9px] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)]">
                      <span className="font-serif text-[20px] leading-none text-[color:var(--color-ink)]">
                        {new Date(nextEvent.startsAt).getDate()}
                      </span>
                      <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                        {formatDate(nextEvent.startsAt, "MMM").replace(".", "")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                        Keyingi tadbir · {relativeDate(nextEvent.startsAt)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[color:var(--color-ink)]">
                        {nextEvent.title}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[color:var(--color-muted)]">
                        <MapPin size={11} /> {nextEvent.location}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- marquee */}
      <section
        aria-label="Klublar ro‘yxati"
        className="relative overflow-hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] py-3.5"
      >
        <div className="marquee-mask">
          <div className="marquee gap-0">
            {[...clubs, ...clubs].map((club, i) => (
              <span key={`${club.id}-${i}`} className="flex items-center whitespace-nowrap">
                <Link
                  href={`/clubs/${club.slug}`}
                  className="px-5 text-[12px] font-medium tracking-[0.01em] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
                >
                  {club.name}
                </Link>
                <span aria-hidden className="h-[3px] w-[3px] rounded-full bg-[color:var(--color-line-strong)]" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- channels */}
      <section className="border-b border-[color:var(--color-line)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6">
          <div className="grid divide-y divide-[color:var(--color-line)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            <Channel
              index="01"
              icon={<LayoutDashboard size={17} />}
              title="Veb-sayt"
              text="Klublar, yangiliklar, tadbirlar va kutubxona"
              href="/clubs"
            />
            <Channel
              index="02"
              icon={<Send size={17} />}
              title="Telegram bot"
              text="@Tsue_clubs_bot — eslatmalar va ariza holati"
              href="https://t.me/Tsue_clubs_bot"
            />
            <Channel
              index="03"
              icon={<Smartphone size={17} />}
              title="Mini-ilova"
              text="O‘qish progressi, RSVP va muhokamalar"
              href="https://t.me/Tsue_clubs_bot/app"
            />
            <Channel
              index="04"
              icon={<Users size={17} />}
              title="Boshqaruv"
              text="A’zolar, kontent va statistika paneli"
              href="/admin"
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- clubs */}
      <section className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6">
        <div className="reveal flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="section-index">01 — Klublar</div>
            <h2 className="display mt-3 text-[34px] text-[color:var(--color-ink)] sm:text-[44px]">
              {clubs.length} klub. Bitta universitet.
            </h2>
            <p className="lede mt-3 max-w-lg">
              Har bir klub — o‘z jamoasi, jadvali va Telegram kanali bilan alohida ekotizim.
            </p>
          </div>
          <Link href="/clubs" className="link-quiet pb-1 text-[13.5px]">
            Barcha klublar <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          {featured ? (
            <Link
              href={`/clubs/${featured.slug}`}
              className="reveal group relative overflow-hidden rounded-[18px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] transition-all duration-500 hover:-translate-y-1 hover:border-[color:var(--color-line-strong)] hover:shadow-[var(--shadow-lift)] lg:col-span-6 lg:row-span-2"
              style={
                {
                  "--club-accent": featured.accent,
                  "--reveal-delay": "60ms",
                } as React.CSSProperties
              }
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.5] transition-opacity duration-500 group-hover:opacity-[0.75]"
                style={{
                  background: `radial-gradient(90% 70% at 0% 0%, ${featured.accent}1a 0%, transparent 60%)`,
                }}
              />

              <div className="relative flex h-full flex-col sm:flex-row">
                <div className="flex flex-1 flex-col justify-between p-7 lg:p-9">
                  <div>
                    <span className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: featured.accent }} />
                      Tanlangan klub · Bookonomics
                    </span>
                    <h3 className="display mt-6 text-[32px] leading-tight text-[color:var(--color-ink)] lg:text-[40px]">
                      {featured.name}
                    </h3>
                    <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
                      {featured.tagline}
                    </p>
                    <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[color:var(--color-muted)]">
                      {featured.summary}
                    </p>
                    {featured.meetingDay && (
                      <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3 py-1.5 text-[11.5px] font-medium text-[color:var(--color-ink-soft)]">
                        <CalendarDays size={12} className="text-[color:var(--club-accent-ink)]" />
                        {featured.meetingDay}
                        {featured.meetingTime ? `, ${featured.meetingTime}` : ""}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[color:var(--color-line)] pt-5 text-[12.5px] text-[color:var(--color-muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} /> {featured._count.memberships} a’zo
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} /> {featured._count.events} tadbir
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen size={13} /> {featured._count.books} asar
                    </span>
                  </div>
                </div>

                <div
                  className="relative flex shrink-0 items-center justify-between gap-4 overflow-hidden border-t border-[color:var(--color-line)] px-7 py-6 text-white sm:w-[216px] sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:px-6 sm:py-9"
                  style={{
                    background: `linear-gradient(
                      160deg,
                      color-mix(in oklab, ${featured.accent} 88%, #ffffff) 0%,
                      ${featured.accent} 42%,
                      color-mix(in oklab, ${featured.accent} 62%, #0a1630) 100%
                    )`,
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                      background:
                        "repeating-radial-gradient(ellipse 140% 120% at 110% -10%, transparent 0 26px, rgb(255 255 255 / 0.16) 26px 27px)",
                      maskImage: "radial-gradient(120% 100% at 90% 0%, #000 0%, transparent 72%)",
                      WebkitMaskImage: "radial-gradient(120% 100% at 90% 0%, #000 0%, transparent 72%)",
                    }}
                  />
                  <ClubLogo
                    name={featured.name}
                    logoUrl={featured.logoUrl}
                    accent={featured.accent}
                    size={72}
                    className="relative max-w-[150px] drop-shadow-[0_16px_24px_rgba(0,0,0,0.45)]"
                  />
                  <div className="relative text-right sm:text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      Klub sahifasi
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white">
                      Ochish
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : null}

          {rest.map((club, i) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="reveal group relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-[color:var(--color-line-strong)] hover:shadow-[var(--shadow-card)] lg:col-span-3"
              style={
                {
                  "--club-accent": club.accent,
                  "--reveal-delay": `${120 + i * 70}ms`,
                } as React.CSSProperties
              }
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <ClubLogo
                    name={club.name}
                    logoUrl={club.logoUrl}
                    accent={club.accent}
                    size={38}
                    rounded="rounded-[10px]"
                  />
                  <ArrowUpRight
                    size={15}
                    className="mt-1 text-[color:var(--color-muted-soft)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--club-accent-ink)]"
                  />
                </div>
                <h3 className="mt-4 font-serif text-[18px] leading-snug text-[color:var(--color-ink)]">
                  {club.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
                  {club.summary}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between text-[11px] text-[color:var(--color-muted)]">
                <span>{CATEGORY_LABELS[club.category as ClubCategory] ?? club.category}</span>
                <span className="tabular-nums">
                  {club._count.memberships > 0 ? `${club._count.memberships} a’zo` : club.meetingDay ?? "Ochiq"}
                </span>
              </div>
            </Link>
          ))}

          <Link
            href="/clubs"
            className="reveal group relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-dashed border-[color:var(--color-line-strong)] p-5 transition-colors duration-300 hover:border-[color:var(--color-ink)] hover:bg-[color:var(--color-surface-2)] lg:col-span-3"
            style={{ "--reveal-delay": "400ms" } as React.CSSProperties}
          >
            <div className="flex items-start justify-between">
              <span className="section-index">Yana {Math.max(clubs.length - 4, 0)} ta</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] transition-colors duration-300 group-hover:border-[color:var(--color-ink)] group-hover:bg-[color:var(--color-ink)] group-hover:text-[color:var(--color-paper)]">
                <ArrowUpRight size={14} />
              </span>
            </div>
            <div>
              <p className="font-serif text-[18px] leading-snug text-[color:var(--color-ink)]">
                Barcha klublarni ko‘rish
              </p>
              <span className="mt-1.5 block text-[11.5px] text-[color:var(--color-muted)]">
                Yo‘nalish bo‘yicha saralash
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------------------- reading */}
      <section className="band-brand grain relative">
        <div aria-hidden className="contour-field" />
        <div className="relative mx-auto grid w-full max-w-[1180px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="reveal">
            <div className="eyebrow text-white/75">Bookonomics · Kitobxonlik dasturi</div>
            <h2 className="display mt-4 text-[36px] text-white sm:text-[46px]">
              Bir kitob —
              <br />
              butun universitet.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/80">
              Har oy yangi asar, bosqichma-bosqich o‘qish va ochiq muhokama. Book Club — platformaning
              yadrosi va birinchi to‘liq ishga tushgan klubi.
            </p>

            <div className="mt-9 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-6">
              <div>
                <div className="font-serif text-[30px] leading-none">
                  <Counter value={community.readers} />
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/65">o‘quvchi</div>
              </div>
              <div>
                <div className="font-serif text-[30px] leading-none">
                  <Counter value={community.average} suffix="%" />
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/65">o‘rtacha</div>
              </div>
              <div>
                <div className="font-serif text-[30px] leading-none">
                  <Counter value={bookCount} />
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/65">kutubxonada</div>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/clubs/book-club" className="btn btn-light btn-lg group">
                Book Club
                <ArrowRight size={15} className="btn-arrow" />
              </Link>
              <Link href="/books" className="btn btn-outline-light btn-lg">
                Kutubxona
              </Link>
            </div>
          </div>

          {cycle && (
            <div className="reveal" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
              <div className="relative overflow-hidden rounded-[20px] border border-white/12 bg-white/[0.05] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Joriy o‘qish · {cycle.milestones.length} bosqich
                  </span>
                  <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10.5px] font-semibold text-white/80">
                    Bookonomics
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-6 sm:flex-row">
                  <CoverArt
                    from={cycle.book.coverFrom}
                    to={cycle.book.coverTo}
                    title={cycle.book.title}
                    author={cycle.book.author}
                    variant="lines"
                    compact
                    className="h-[176px] w-[124px] shrink-0 shadow-[0_24px_40px_-24px_rgba(0,0,0,0.9)]"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[26px] leading-tight">{cycle.book.title}</h3>
                    <p className="mt-1.5 text-[13px] text-white/55">
                      {cycle.book.author}
                      {cycle.book.year ? ` · ${cycle.book.year}` : ""}
                    </p>
                    <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-white/65">
                      {cycle.book.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-0">
                  {cycle.milestones.slice(0, 3).map((m, i) => {
                    const done = community.average >= ((i + 1) / Math.max(cycle.milestones.length, 1)) * 100;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-3 border-t border-white/10 py-2.5 text-[12px]"
                      >
                        <span className="flex items-center gap-2.5 text-white/80">
                          <span
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] ${
                              done ? "border-white bg-white text-[#08102c]" : "border-white/25 text-white/30"
                            }`}
                            aria-hidden
                          >
                            {done ? "✓" : ""}
                          </span>
                          {m.title}
                        </span>
                        <span className="shrink-0 text-white/40">{formatDate(m.dueAt, "d MMM")}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[11.5px] text-white/50">
                    Yakuniy uchrashuv:{" "}
                    <span className="text-white/85">
                      {cycle.meetingAt ? formatDate(cycle.meetingAt, "d MMMM, HH:mm") : "belgilanmagan"}
                    </span>
                  </span>
                  <Link href="/app/read" className="text-[11.5px] font-semibold text-white/80 hover:text-white">
                    Progressni yangilash
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------- agenda + news */}
      <section className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="reveal">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="section-index">02 — Jadval</div>
                <h2 className="display mt-3 text-[30px] text-[color:var(--color-ink)] sm:text-[36px]">
                  Yaqin kunlarda
                </h2>
              </div>
              <Link href="/events" className="link-quiet pb-1 text-[13px]">
                Taqvim <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="mt-6">
              {events.length === 0 && (
                <p className="border-t border-[color:var(--color-line)] py-6 text-sm text-[color:var(--color-muted)]">
                  Hozircha rejalashtirilgan tadbir yo‘q.
                </p>
              )}
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group grid grid-cols-[56px_1fr_auto] items-start gap-5 border-t border-[color:var(--color-line)] py-5 transition-colors last:border-b hover:bg-[color:var(--color-surface-2)]"
                >
                  <div className="pt-0.5">
                    <div className="font-serif text-[26px] leading-none text-[color:var(--color-ink)]">
                      {new Date(event.startsAt).getDate()}
                    </div>
                    <div className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      {formatDate(event.startsAt, "MMM").replace(".", "")}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: event.club.accent }} />
                      {event.club.name}
                    </div>
                    <h3 className="mt-1.5 text-[16px] font-semibold leading-snug text-[color:var(--color-ink)] transition-colors group-hover:text-[color:var(--color-link)]">
                      {event.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[color:var(--color-muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={12} /> {timeRange(event.startsAt, event.endsAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={12} /> {event.location}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="mt-1 text-[color:var(--color-muted-soft)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--color-ink)]"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="reveal" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="section-index">03 — Yangiliklar</div>
                <h2 className="display mt-3 text-[30px] text-[color:var(--color-ink)] sm:text-[36px]">
                  Klub hayoti
                </h2>
              </div>
              <Link href="/news" className="link-quiet pb-1 text-[13px]">
                Barchasi <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="mt-6">
              {news[0] && <NewsCard item={news[0]} />}
              {news.slice(1, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group flex items-start justify-between gap-4 border-b border-[color:var(--color-line)] py-4 first:border-t"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                      {item.club?.name ?? "Klub hayoti"}
                      {item.publishedAt ? ` · ${formatDate(item.publishedAt, "d MMM")}` : ""}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-[14px] font-medium leading-snug text-[color:var(--color-ink)] transition-colors group-hover:text-[color:var(--color-link)]">
                      {item.title}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="mt-1 shrink-0 text-[color:var(--color-muted-soft)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--color-ink)]"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- library */}
      <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-surface-2)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6">
          <div className="reveal flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <div className="section-index">04 — Kutubxona</div>
              <h2 className="display mt-3 text-[30px] text-[color:var(--color-ink)] sm:text-[38px]">
                Ijtimoiy faollik indeksi
              </h2>
              <p className="lede mt-2.5 max-w-xl">
                Vazirlikning 186-son buyrug‘i bo‘yicha 12 asar. Har bir kitob uchun klub miqyosida
                tayyorgarlik sessiyalari o‘tkaziladi.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="neutral">{bookCount} asar</Badge>
              <Link href="/books" className="link-quiet text-[13px]">
                Katalog <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {books.map((book, i) => (
              <div
                key={book.id}
                className="reveal"
                style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- cta */}
      <section className="mx-auto w-full max-w-[1180px] px-4 pt-16 sm:px-6">
        <div className="band-dark grain relative overflow-hidden rounded-[24px]">
          <div aria-hidden className="contour-field" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(30,158,79,0.35),transparent_65%)]"
          />
          <div className="relative grid gap-10 px-6 py-12 sm:px-12 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="reveal">
              <div className="eyebrow text-white/50">Yoshlar ittifoqi · TDIU</div>
              <h2 className="display mt-4 text-[32px] text-white sm:text-[42px]">
                Jamoaga qo‘shiling.
              </h2>
              <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-white/60">
                Ariza bir daqiqada to‘ldiriladi. Klub rahbari Telegram orqali javob beradi — natijani
                shu yerda va botda kuzatasiz.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/join" className="btn btn-light btn-lg group">
                  A’zo bo‘lish
                  <ArrowRight size={16} className="btn-arrow" />
                </Link>
                <a
                  href="https://t.me/Tsue_clubs_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light btn-lg"
                >
                  <Send size={15} /> Telegram bot
                </a>
              </div>
            </div>

            <div className="reveal lg:justify-self-end" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
              <div className="rounded-[16px] border border-white/12 bg-white/[0.04] p-5 backdrop-blur-sm">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Rasmiy loyiha
                </p>
                <YoshlarIttifoqiLockup height={96} className="mt-4" />
                <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/tsue-emblem.png"
                    alt="TDIU gerbi"
                    width={28}
                    height={28}
                    loading="lazy"
                    className="h-7 w-7 opacity-90"
                  />
                  <p className="text-[11px] leading-snug text-white/45">
                    Toshkent davlat iqtisodiyot universiteti
                    <br />
                    Yoshlar masalalari bo‘yicha bo‘lim
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- contact rail */}
      <section className="mx-auto w-full max-w-[1180px] px-4 pt-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-5 py-4">
          <p className="text-[13px] text-[color:var(--color-muted)]">
            Savol bormi? Klub rahbari bilan bog‘laning yoki bot orqali yozing.
          </p>
          <div className="flex items-center gap-4 text-[12.5px] font-semibold">
            <a href="https://t.me/tsuebookclub" target="_blank" rel="noreferrer" className="link-quiet">
              <MessageSquare size={13} /> @tsuebookclub
            </a>
            <a href="mailto:info@tsue.uz" className="link-quiet">
              info@tsue.uz
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dd className="font-serif text-[27px] leading-none text-[color:var(--color-ink)]">
        <Counter value={value} />
      </dd>
      <dt className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
        {label}
      </dt>
    </div>
  );
}

function Channel({
  index,
  icon,
  title,
  text,
  href,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group relative flex items-start gap-4 px-1 py-6 transition-colors hover:bg-[color:var(--color-surface-2)] sm:px-5 lg:px-6"
    >
      <span className="section-index mt-1">{index}</span>
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] text-[color:var(--color-ink)] transition-colors group-hover:border-[color:var(--color-line-strong)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--color-ink)]">
          {title}
          <ArrowUpRight
            size={13}
            className="text-[color:var(--color-muted-soft)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--color-ink)]"
          />
        </span>
        <span className="mt-1 block text-[11.5px] leading-snug text-[color:var(--color-muted)]">{text}</span>
      </span>
    </a>
  );
}
