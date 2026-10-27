import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, MapPin, Send, Smartphone, LayoutDashboard, Users } from "lucide-react";
import { BookCover } from "@/components/ui/book-cover";
import { ClubLogo } from "@/components/ui/club-logo";
import { YoshlarIttifoqiLockup } from "@/components/brand/marks";
import { CATEGORY_LABELS, type ClubCategory } from "@/config/clubs";
import { formatDate, tashkentDayStart, timeRange } from "@/lib/format";
import { cycleTiming } from "@/lib/reading";
import {
  getClubs,
  getCommunityProgress,
  getCurrentCycle,
  getLatestNews,
  getUpcomingEvents,
} from "@/lib/queries";
import { db } from "@/lib/db";
import { addDays } from "date-fns";

export const revalidate = 60;

/* The date line on the nameplate. A paper states the day it was printed. */
const EDITION = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tashkent",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function HomePage() {
  const clubs = await getClubs();
  const bookClub = clubs.find((c) => c.slug === "book-club");
  const [events, news, cycle, community] = await Promise.all([
    getUpcomingEvents({ limit: 5 }),
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

  const weekStart = tashkentDayStart();
  const weekEvents = await db.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: weekStart, lt: addDays(weekStart, 7) } },
    orderBy: { startsAt: "asc" },
    take: 3,
    select: { id: true, title: true, startsAt: true },
  });

  const timing = cycle ? cycleTiming(cycle) : null;
  const featured = bookClub ?? clubs[0];
  const others = clubs.filter((c) => c.id !== featured?.id);
  const today = EDITION.format(new Date()).toUpperCase();

  return (
    <div className="bg-[color:var(--color-paper)]">
      {/* ══════════════════════════════════════════════════════════ nameplate */}
      <div className="gz-wrap">
        <div className="gz-nameplate">
          <div>
            <span className="gz-nameplate__title">Universitet byulleteni</span>
            <span className="gz-nameplate__sub">
              O‘zbekiston Yoshlar ittifoqi · Toshkent davlat iqtisodiyot universiteti
            </span>
          </div>
          <div className="gz-edition">
            <span>{today}</span>
            <span>№ {String(clubs.length).padStart(2, "0")}</span>
            <span>Bepul nashr</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ hero */}
      <section className="gz-wrap">
        <div className="grid gap-y-12 pt-9 pb-11 lg:grid-cols-12 lg:gap-x-8">
          {/* the statement */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="gz-kicker">Universitet hayoti</span>
              <span aria-hidden className="h-px w-8 bg-[color:var(--color-line-strong)]" />
              <span className="text-[11px] text-[color:var(--color-muted)]">
                {clubs.length} yo‘nalish · {memberCount} a’zo · {eventCount} tadbir
              </span>
            </div>

            <h1 className="gz-display mt-6 max-w-[16ch]">
              <span className="gz-rise" data-in="true">
                <span style={{ "--gz-delay": "40ms" } as React.CSSProperties}>Universitetdagi</span>
              </span>
              <span className="gz-rise" data-in="true">
                <span style={{ "--gz-delay": "150ms" } as React.CSSProperties}>har bir tashabbus —</span>
              </span>
              <span className="gz-rise" data-in="true">
                <span style={{ "--gz-delay": "260ms" } as React.CSSProperties}>
                  <em>bitta tartibda.</em>
                </span>
              </span>
            </h1>

            <div className="mt-8 grid gap-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <p className="gz-lede">
                Klub jadvali, tadbirlar, kitobxonlik dasturi va arizalar — bitta hisobda.
                Telegram bot eslatadi, mini-ilova o‘qishni kuzatadi, sayt esa hammasini
                bir joyda ko‘rsatadi.
              </p>
              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                <Link href="/clubs" className="gz-btn">
                  Klublarni ko‘rish <ArrowRight size={14} />
                </Link>
                <Link href="/join" className="gz-btn gz-btn--ghost">
                  A’zo bo‘lish
                </Link>
              </div>
            </div>
          </div>

          {/* the reading ledger — a newspaper column, not a floating card */}
          <aside className="lg:col-span-4 lg:pl-8 lg:[border-left:1px_solid_var(--color-line)]">
            <div className="flex items-baseline justify-between">
              <span className="gz-kicker">{cycle?.program ?? "Bookomics"}</span>
              <Link href="/books" className="gz-link text-[11px] font-semibold text-[color:var(--color-muted)]">
                Katalog <ArrowUpRight size={11} />
              </Link>
            </div>

            {cycle ? (
              <div className="mt-4 flex gap-4">
                <BookCover
                  coverUrl={cycle.book.coverUrl}
                  from={cycle.book.coverFrom}
                  to={cycle.book.coverTo}
                  title={cycle.book.title}
                  author={cycle.book.author}
                  priority
                  className="h-[132px] w-[88px] shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="gz-h3 truncate">{cycle.book.title}</h2>
                  <p className="mt-1 text-[11.5px] text-[color:var(--color-muted)]">
                    {cycle.book.author}
                    {cycle.book.year ? ` · ${cycle.book.year}` : ""}
                  </p>
                  <div className="mt-3">
                    <div className="gz-measure">
                      <span className="gz-measure__fill" style={{ width: `${community.average}%` }} />
                    </div>
                    <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      {community.average}% o‘rtacha · {community.readers} o‘quvchi
                    </p>
                  </div>
                  <Link href={`/books/${cycle.book.id}`} className="gz-link mt-3 text-[12px] font-semibold">
                    Asar sahifasi <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="gz-body mt-4">Hozir faol o‘qish davri yo‘q.</p>
            )}

            {timing && (
              <div className="mt-5 border-t border-[color:var(--color-line)] pt-3.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                  {timing.heading}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[color:var(--color-ink)]">
                  {cycle?.meetingAt ? formatDate(cycle.meetingAt, "d MMMM, HH:mm") : "—"}
                  <span className="text-[color:var(--color-muted)]"> · {cycle?.location ?? "TDIU"}</span>
                </p>
              </div>
            )}

            {events[0] && (
              <div className="mt-4 border-t border-[color:var(--color-line)] pt-3.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                  Keyingi tadbir
                </p>
                <Link href={`/events/${events[0].id}`} className="gz-link mt-1 text-[13px] leading-snug">
                  <span className="line-clamp-2">{events[0].title}</span>
                </Link>
                <p className="mt-1 text-[11.5px] text-[color:var(--color-muted)]">
                  {formatDate(events[0].startsAt, "d MMM, HH:mm")} · {events[0].location}
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ this week: a rule */}
      <div className="border-y border-[color:var(--color-line)] bg-[color:var(--color-surface-2)]">
        <div className="gz-wrap flex flex-wrap items-center gap-x-7 gap-y-2 py-3">
          <span className="gz-kicker shrink-0">Bu hafta</span>
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-6 gap-y-1.5 text-[12.5px]">
            {weekEvents.length === 0 ? (
              <span className="text-[color:var(--color-muted)]">Kelasi yetti kunda tadbir yo‘q.</span>
            ) : (
              weekEvents.map((e) => (
                <Link key={e.id} href={`/events/${e.id}`} className="gz-link">
                  <span className="font-variant-numeric tabular-nums text-[color:var(--color-muted)]">
                    {formatDate(e.startsAt, "d MMM")}
                  </span>
                  <span className="text-[color:var(--color-ink-soft)]">{e.title}</span>
                </Link>
              ))
            )}
          </div>
          <div className="flex shrink-0 items-center gap-5 text-[12px] font-semibold">
            <Link href="/topish" className="gz-link">
              Menga mos klub <ArrowUpRight size={12} />
            </Link>
            <Link href="/haftalik" className="gz-link">
              Haftalik jadval
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ 01 · the clubs */}
      <section className="gz-wrap">
        <div className="gz-section">
          <div className="gz-rail">
            <span className="gz-rail__num">01</span>
            <span className="gz-rail__label">Klublar</span>
            <span className="gz-rail__meta">
              {clubs.length} yo‘nalish,
              <br />
              {new Set(clubs.map((c) => c.category)).size} kategoriya
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="gz-h2 max-w-[22ch]">
              Har bir klub — o‘z jamoasi, jadvali va kanali bilan alohida ekotizim.
            </h2>

            {/* the featured club: a two-column spread */}
            {featured && (
              <div className="mt-9 grid gap-8 border-t border-[color:var(--color-ink)] pt-8 md:grid-cols-[minmax(0,1fr)_228px]">
                <div className="min-w-0">
                  <span className="gz-kicker">
                    Tanlangan · {cycle?.program ?? "Kitobxonlik dasturi"}
                  </span>
                  <h3 className="gz-display mt-3 !text-[clamp(34px,4.4vw,58px)]">
                    <Link href={`/clubs/${featured.slug}`} className="gz-link">
                      {featured.name}
                    </Link>
                  </h3>
                  <p className="gz-lede mt-3">{featured.tagline}</p>
                  <p className="gz-body mt-3">{featured.summary}</p>

                  <dl className="mt-7 grid max-w-lg grid-cols-3 gap-4 border-t border-[color:var(--color-line)] pt-4">
                    {[
                      { k: "A’zo", v: featured._count.memberships },
                      { k: "Tadbir", v: featured._count.events },
                      { k: "Asar", v: featured._count.books },
                    ].map((s) => (
                      <div key={s.k}>
                        <dd className="gz-num text-[26px] leading-none text-[color:var(--color-ink)]">{s.v}</dd>
                        <dt className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                          {s.k}
                        </dt>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 flex flex-wrap items-center gap-5 text-[12.5px]">
                    <Link href={`/clubs/${featured.slug}`} className="gz-link font-semibold">
                      Klub sahifasi <ArrowUpRight size={13} />
                    </Link>
                    {featured.meetingDay && (
                      <span className="inline-flex items-center gap-1.5 text-[color:var(--color-muted)]">
                        <CalendarDays size={12} /> {featured.meetingDay}
                        {featured.meetingTime ? `, ${featured.meetingTime}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="gz-plate min-h-[228px]">
                  <ClubLogo
                    name={featured.name}
                    logoUrl={featured.logoUrl}
                    accent={featured.accent}
                    size={104}
                    className="relative"
                  />
                </div>
              </div>
            )}

            {/* the index: every other club, as ruled rows */}
            <div className="mt-9 grid gap-x-10 sm:grid-cols-2">
              {others.slice(0, 10).map((c) => (
                <Link key={c.id} href={`/clubs/${c.slug}`} className="gz-row">
                  <span className="gz-row__name truncate">{c.name}</span>
                  <span className="gz-row__meta">
                    {CATEGORY_LABELS[c.category as ClubCategory] ?? c.category}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-[12px] text-[color:var(--color-muted)]">
                Yana {Math.max(0, others.length - 10)} ta klub katalogda.
              </p>
              <Link href="/clubs" className="gz-link text-[12.5px] font-semibold">
                Barcha klublar <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════= 02 · the programme */}
      {cycle && (
        <section className="gz-block">
          <div className="gz-wrap">
            <div className="gz-section !border-t-0">
              <div className="gz-rail">
                <span className="gz-rail__num">02</span>
                <span className="gz-rail__label">O‘qish dasturi</span>
                <span className="gz-rail__meta">{cycle.program ?? "Bookomics"}</span>
              </div>

              <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_248px] md:gap-12">
                <div className="min-w-0">
                  <h2 className="gz-display !text-[clamp(34px,5vw,64px)]">
                    Bir kitob —<br />
                    <em>butun universitet.</em>
                  </h2>
                  <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--gz-block-muted)]">
                    Har oy yangi asar, bosqichma-bosqich o‘qish va ochiq muhokama. Book Club —
                    platformaning yadrosi va birinchi to‘liq ishga tushgan klubi.
                  </p>

                  <div className="mt-8 flex flex-wrap items-end gap-x-12 gap-y-6 border-t border-[var(--gz-block-line)] pt-6">
                    {[
                      { v: community.readers, k: "o‘quvchi" },
                      { v: `${community.average}%`, k: "o‘rtacha progress" },
                      { v: bookCount, k: "kutubxonada" },
                    ].map((s) => (
                      <div key={s.k}>
                        <div className="gz-num text-[40px] leading-none">{s.v}</div>
                        <div className="mt-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--gz-block-muted)]">
                          {s.k}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-5">
                    <Link href="/clubs/book-club" className="gz-btn !border-[var(--gz-block-ink)] !bg-[var(--gz-block-ink)] !text-[var(--gz-block)] hover:!bg-transparent hover:!text-[var(--gz-block-ink)]">
                      Book Club <ArrowRight size={14} />
                    </Link>
                    <Link href="/books" className="gz-link text-[13px] font-semibold text-[var(--gz-block-ink)]">
                      Kutubxona
                    </Link>
                  </div>
                </div>

                {/* the current volume, set like a book review */}
                <div className="border-t border-[var(--gz-block-line)] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <span className="gz-kicker">{timing?.heading ?? "Joriy o‘qish"}</span>
                  <div className="mt-4 flex gap-4">
                    <BookCover
                      coverUrl={cycle.book.coverUrl}
                      from={cycle.book.coverFrom}
                      to={cycle.book.coverTo}
                      title={cycle.book.title}
                      author={cycle.book.author}
                      className="h-[124px] w-[83px] shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="gz-h3">{cycle.book.title}</h3>
                      <p className="mt-1 text-[11.5px] text-[var(--gz-block-muted)]">{cycle.book.author}</p>
                    </div>
                  </div>

                  {cycle.milestones.length > 0 && (
                    <ol className="mt-5 space-y-0">
                      {cycle.milestones.map((m, i) => (
                        <li
                          key={m.id}
                          className="flex items-baseline justify-between gap-3 border-t border-[var(--gz-block-line)] py-2 text-[12.5px]"
                        >
                          <span className="min-w-0 truncate">
                            <span className="mr-2 font-variant-numeric tabular-nums text-[var(--gz-block-muted)]">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {m.title}
                          </span>
                          <span className="shrink-0 font-variant-numeric tabular-nums text-[var(--gz-block-muted)]">
                            {formatDate(m.dueAt, "d MMM")}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--gz-block-muted)]">
                    {timing?.closed ? "Yakuniy uchrashuv bo‘lib o‘tdi: " : "Yakuniy uchrashuv: "}
                    {cycle.meetingAt ? formatDate(cycle.meetingAt, "d MMMM, HH:mm") : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════ 03 · the library */}
      <section className="gz-wrap">
        <div className="gz-section">
          <div className="gz-rail">
            <span className="gz-rail__num">03</span>
            <span className="gz-rail__label">Kutubxona</span>
            <span className="gz-rail__meta">
              “Ijtimoiy faollik
              <br />
              indeksi” ro‘yxati
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="gz-h2 max-w-[26ch]">
                Vazirlikning 186-son buyrug‘i bo‘yicha o‘n ikkita asar.
              </h2>
              <Link href="/books" className="gz-link shrink-0 text-[12.5px] font-semibold">
                Butun katalog <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {books.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`} className="group block">
                  <BookCover
                    coverUrl={book.coverUrl}
                    from={book.coverFrom}
                    to={book.coverTo}
                    title={book.title}
                    author={book.author}
                    sizes="(max-width: 640px) 42vw, 190px"
                  />
                  <h3 className="mt-3 border-t border-[color:var(--color-line)] pt-2.5 text-[13.5px] font-semibold leading-snug text-[color:var(--color-ink)] group-hover:underline group-hover:decoration-[color:var(--color-brass-line)] group-hover:underline-offset-4">
                    {book.title}
                  </h3>
                  <p className="mt-0.5 text-[11.5px] text-[color:var(--color-muted)]">
                    {book.author}
                    {book.year ? ` · ${book.year}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════ 04 · agenda and the news */}
      <section className="gz-wrap">
        <div className="gz-section">
          <div className="gz-rail">
            <span className="gz-rail__num">04</span>
            <span className="gz-rail__label">Taqvim</span>
            <span className="gz-rail__meta">
              Kelgusi
              <br />
              tadbirlar
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
            {/* agenda */}
            <div className="min-w-0">
              <div className="flex items-end justify-between gap-4 border-b border-[color:var(--color-ink)] pb-3">
                <h2 className="gz-h2">Yaqin kunlarda</h2>
                <Link href="/events" className="gz-link shrink-0 text-[12px] font-semibold">
                  Taqvim <ArrowUpRight size={12} />
                </Link>
              </div>

              <ul className="mt-1">
                {events.slice(0, 4).map((e) => (
                  <li key={e.id} className="border-b border-[color:var(--color-line)]">
                    <Link href={`/events/${e.id}`} className="group grid grid-cols-[52px_minmax(0,1fr)] items-start gap-4 py-4">
                      <span className="gz-date">
                        <span className="gz-date__day">{formatDate(e.startsAt, "d")}</span>
                        <span className="gz-date__month">{formatDate(e.startsAt, "MMM").replace(".", "")}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-baseline gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                          <span aria-hidden className="mt-[-1px] h-1 w-1 rounded-full" style={{ background: e.club.accent }} />
                          {e.club.name}
                        </span>
                        <span className="mt-1.5 block font-serif text-[17px] leading-snug text-[color:var(--color-ink)] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                          {e.title}
                        </span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[color:var(--color-muted)]">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={11} /> {timeRange(e.startsAt, e.endsAt)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={11} /> {e.location}
                          </span>
                          {typeof e._count?.rsvps === "number" && (
                            <span className="inline-flex items-center gap-1.5">
                              <Users size={11} /> {e._count.rsvps}
                              {e.capacity ? `/${e.capacity}` : ""}
                            </span>
                          )}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* news: lead story + two briefs */}
            <div className="min-w-0 lg:border-l lg:border-[color:var(--color-line)] lg:pl-12">
              <div className="flex items-end justify-between gap-4 border-b border-[color:var(--color-ink)] pb-3">
                <h2 className="gz-h2">Klub hayoti</h2>
                <Link href="/news" className="gz-link shrink-0 text-[12px] font-semibold">
                  Barchasi <ArrowUpRight size={12} />
                </Link>
              </div>

              {news[0] && (
                <Link href={`/news/${news[0].slug}`} className="group mt-4 block">
                  <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4">
                    <div className="gz-plate h-[104px] overflow-hidden">
                      {news[0].imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={news[0].imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="relative h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                        {formatDate(news[0].publishedAt ?? new Date(), "d MMMM")}
                      </span>
                      <h3 className="mt-1.5 font-serif text-[21px] leading-tight text-[color:var(--color-ink)] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[5px]">
                        {news[0].title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
                        {news[0].excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              <ul className="mt-5">
                {news.slice(1, 3).map((n) => (
                  <li key={n.id} className="border-t border-[color:var(--color-line)]">
                    <Link href={`/news/${n.slug}`} className="group block py-3.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                        {formatDate(n.publishedAt ?? new Date(), "d MMMM")}
                      </span>
                      <h3 className="mt-1 text-[14.5px] font-semibold leading-snug text-[color:var(--color-ink)] group-hover:underline group-hover:underline-offset-4">
                        {n.title}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ 05 · the four doors */}
      <section className="gz-wrap">
        <div className="gz-section">
          <div className="gz-rail">
            <span className="gz-rail__num">05</span>
            <span className="gz-rail__label">Tizim</span>
            <span className="gz-rail__meta">
              Sayt, bot,
              <br />
              mini-ilova, panel
            </span>
          </div>

          <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: LayoutDashboard, title: "Veb-sayt", text: "Klublar, yangiliklar, tadbirlar va kutubxona", href: "/clubs" },
              { icon: Send, title: "Telegram bot", text: "@Tsue_clubs_bot — eslatmalar va ariza holati", href: "https://t.me/Tsue_clubs_bot" },
              { icon: Smartphone, title: "Mini-ilova", text: "O‘qish progressi, RSVP va muhokamalar", href: "https://t.me/Tsue_clubs_bot/app" },
              { icon: Users, title: "Boshqaruv", text: "A’zolar, kontent va statistika paneli", href: "/admin" },
            ].map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="group block border-t border-[color:var(--color-ink)] pt-4"
              >
                <c.icon size={17} strokeWidth={1.6} className="text-[color:var(--color-ink-soft)]" />
                <h3 className="mt-3 font-serif text-[18px] leading-tight text-[color:var(--color-ink)]">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[color:var(--color-muted)]">{c.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[color:var(--color-ink)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Ochish <ArrowUpRight size={11} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ join us */}
      <section className="gz-wrap pb-16">
        <div className="grid gap-8 border-t border-[color:var(--color-ink)] pt-9 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
          <div className="min-w-0">
            <span className="gz-kicker">A’zolik</span>
            <h2 className="gz-display mt-4 !text-[clamp(32px,4.6vw,62px)]">
              Jamoaga <em>qo‘shiling.</em>
            </h2>
            <p className="gz-body mt-4 max-w-md">
              Ariza bir daqiqada to‘ldiriladi. Klub rahbari Telegram orqali javob beradi —
              natijani shu yerda va botda kuzatasiz.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link href="/join" className="gz-btn">
                Ariza topshirish <ArrowRight size={14} />
              </Link>
              <a href="https://t.me/Tsue_clubs_bot" target="_blank" rel="noreferrer" className="gz-btn gz-btn--ghost">
                Telegram bot
              </a>
            </div>
          </div>

          <div className="gz-plate min-h-[190px] p-6">
            <YoshlarIttifoqiLockup className="relative" height={54} />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-line)] pt-4 text-[11.5px] text-[color:var(--color-muted)]">
          <span className="inline-flex items-center gap-2">
            <BookOpen size={12} /> Muqovalar nashriyot variantlari. Ro‘yxat Vazirlikning 186-son buyrug‘i asosida.
          </span>
          <span className="inline-flex items-center gap-4">
            <a href="https://t.me/tsuebookclub" target="_blank" rel="noreferrer" className="gz-link">
              @tsuebookclub
            </a>
            <a href="https://t.me/Tsue_clubs_bot" target="_blank" rel="noreferrer" className="gz-link">
              @Tsue_clubs_bot
            </a>
          </span>
        </div>
      </section>
    </div>
  );
}
