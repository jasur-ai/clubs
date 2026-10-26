import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, Clock, MapPin, MessageSquare, Send, Users } from "lucide-react";
import { getClubSeed, CATEGORY_LABELS, type ClubCategory } from "@/config/clubs";
import { getClubBySlug, getCurrentCycle, getCycleHistory, getPastEvents, getUpcomingEvents, getCommunityProgress } from "@/lib/queries";
import { EventRow, BookRow } from "@/components/site/cards";
import { CoverArt } from "@/components/ui/cover-art";
import { Avatar, Badge, ProgressBar, SectionHeading } from "@/components/ui/primitives";
import { ClubLogo } from "@/components/ui/club-logo";
import { CalendarSubscribe } from "@/components/site/calendar-subscribe";
import { SaveButton } from "@/components/site/save-button";
import { ShareButton } from "@/components/site/share-button";
import { formatDate } from "@/lib/format";
import { getChannelFeed, channelUsername } from "@/lib/channel-feed";
import { db } from "@/lib/db";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) return { title: "Klub topilmadi" };
  const category = CATEGORY_LABELS[club.category as ClubCategory] ?? "Klub";
  const card = `/api/og?title=${encodeURIComponent(club.name)}&eyebrow=${encodeURIComponent(category)}&meta=${encodeURIComponent(club.tagline)}`;
  return {
    title: club.name,
    description: club.summary,
    openGraph: { title: club.name, description: club.tagline, images: [{ url: card, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: club.name, description: club.tagline, images: [card] },
  };
}

export default async function ClubPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const seed = getClubSeed(slug);
  const isBookClub = slug === "book-club";

  const [events, past, cycle, history, community, partners] = await Promise.all([
    getUpcomingEvents({ clubId: club.id, limit: 3 }),
    getPastEvents({ clubId: club.id, limit: 3 }),
    isBookClub ? getCurrentCycle(club.id) : Promise.resolve(null),
    isBookClub ? getCycleHistory(club.id, 4) : Promise.resolve([]),
    isBookClub ? getCommunityProgress(club.id) : Promise.resolve({ average: 0, readers: 0 }),
    db.club.findMany({
      where: { isActive: true, slug: { not: slug } },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, summary: true, category: true, accent: true, logoUrl: true, coverStyle: true, _count: { select: { memberships: true } } },
    }),
  ]);

  // Recommendation first, then everything else: a student reading the Debate Club
  // page is more likely to care about another speaking club than a random one.
  const related = [...partners]
    .sort((a, b) => {
      const sameA = a.category === club.category ? 0 : 1;
      const sameB = b.category === club.category ? 0 : 1;
      return sameA - sameB || b._count.memberships - a._count.memberships;
    })
    .slice(0, 3);

  const leaders = await db.membership.findMany({
    where: { clubId: club.id, status: "ACTIVE" },
    orderBy: [{ user: { points: "desc" } }],
    take: 5,
    select: { id: true, role: true, user: { select: { firstName: true, lastName: true, points: true } } },
  });
  const topPoints = Math.max(1, ...leaders.map((leader) => leader.user.points));

  const channel = channelUsername(club.telegramUrl);
  const feed = channel ? await getChannelFeed(channel, 3) : [];

  return (
    <div style={{ "--club-accent": club.accent } as React.CSSProperties}>
      {/* hero */}
      <section className="club-surface relative overflow-hidden border-b border-[color:var(--color-line)]">
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:pb-16">
          <nav aria-label="Breadcrumb" className="text-[12px] text-[color:var(--color-muted)]">
            <Link href="/" className="hover:text-[color:var(--color-ink)]">Bosh sahifa</Link>
            <span className="mx-2">/</span>
            <Link href="/clubs" className="hover:text-[color:var(--color-ink)]">Klublar</Link>
            <span className="mx-2">/</span>
            <span className="text-[color:var(--color-ink-soft)]">{club.name}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <ClubLogo
                  name={club.name}
                  logoUrl={club.logoUrl}
                  accent={club.accent}
                  size={72}
                  rounded="rounded-[14px]"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{CATEGORY_LABELS[club.category as ClubCategory] ?? club.category}</Badge>
                  <Badge tone="neutral">{club._count.memberships} a’zo</Badge>
                  {isBookClub && <Badge tone="navy">Bookonomics</Badge>}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <SaveButton
                    kind="club"
                    id={club.id}
                    title={club.name}
                    meta={club.tagline ?? undefined}
                    href={`/clubs/${club.slug}`}
                    compact
                  />
                  <ShareButton
                    title={`${club.name} — TDIU Clubs`}
                    text={club.tagline}
                    path={`/clubs/${club.slug}`}
                    compact
                  />
                </div>
              </div>
              <h1 className="display mt-4 text-[40px] leading-[1.03] sm:text-[54px]">{club.name}</h1>
              <p className="mt-3 font-serif text-[20px] leading-snug text-[color:var(--club-accent-ink)]">{club.tagline}</p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--color-muted)]">{club.summary}</p>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[color:var(--color-ink-soft)]">
                {club.meetingDay && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} /> {club.meetingDay}
                    {club.meetingTime ? `, ${club.meetingTime}` : ""}
                  </span>
                )}
                {club.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} /> {club.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} /> Haftada 2 uchrashuv
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/join?club=${club.slug}`} className="btn btn-accent btn-lg">
                  A’zo bo‘lish <ArrowRight size={16} />
                </Link>
                {club.telegramUrl && (
                  <a href={club.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
                    <Send size={15} /> Telegram
                  </a>
                )}
                <Link href="/app" className="btn btn-secondary btn-lg">
                  <MessageSquare size={15} /> Mini-ilova
                </Link>

              </div>
            </div>

            <div className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ClubLogo name={club.name} logoUrl={club.logoUrl} accent={club.accent} size={28} rounded="rounded-[7px]" />
                  <span className="eyebrow">Klub pasporti</span>
                </div>
                <span className="truncate font-serif text-[13px] text-[color:var(--color-muted)]">{club.shortName ?? club.name}</span>
              </div>
              <div className="mt-5 grid grid-cols-3 divide-x divide-[color:var(--color-line)] text-center">
                <div>
                  <div className="font-serif text-[26px] leading-none">{club._count.memberships}</div>
                  <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">a’zo</div>
                </div>
                <div>
                  <div className="font-serif text-[26px] leading-none">{club._count.events}</div>
                  <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">tadbir</div>
                </div>
                <div>
                  <div className="font-serif text-[26px] leading-none">{club._count.books}</div>
                  <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">kitob</div>
                </div>
              </div>
              <div className="mt-5 space-y-2 border-t border-[color:var(--color-line)] pt-4 text-[12.5px]">
                {club.memberships.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[color:var(--color-muted)]">Rahbariyat</span>
                    <span className="flex -space-x-1.5">
                      {club.memberships.map((m) => (
                        <Avatar key={m.id} first={m.user.firstName} last={m.user.lastName} size={24} className="ring-2 ring-white" />
                      ))}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[color:var(--color-muted)]">Telegram</span>
                  {club.telegramUrl ? (
                    <a href={club.telegramUrl} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--club-accent-ink)]">
                      @{club.telegramUrl.split("/").pop()}
                    </a>
                  ) : (
                    <span className="text-[color:var(--color-muted-soft)]">—</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[color:var(--color-muted)]">A’zolik</span>
                  <span className="font-semibold">Ochiq</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* about + projects */}
      <section id="loyihalar" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHeading eyebrow="Klub haqida" title="Nima qilamiz" />
            <p className="prose-editorial mt-5">{club.description}</p>
            {club.instagramUrl && (
              <a href={club.instagramUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm mt-6">
                Instagram
              </a>
            )}
          </div>
          {seed?.projects?.length ? (
            <div className="space-y-3">
              {seed.projects.map((p) => (
                <div key={p.title} className="rounded-[12px] border border-[color:var(--color-line)] bg-white p-5">
                  <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">{p.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">{p.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-6">
              <h3 className="text-[15px] font-semibold">Faoliyat yo‘nalishlari</h3>
              <ul className="mt-3 space-y-2.5 text-[13.5px] text-[color:var(--color-muted)]">
                <li>Haftalik uchrashuvlar va amaliy mashg‘ulotlar</li>
                <li>Universitet miqyosidagi tadbirlar va tanlovlar</li>
                <li>Boshqa universitetlar va tashkilotlar bilan hamkorlik</li>
                <li>Yangi a’zolar uchun suhbat va yo‘naltiruvchi sessiya</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* current reading */}
      {isBookClub && cycle && (
        <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-surface-2)]">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
            <SectionHeading
              eyebrow="Joriy o‘qish"
              title="Bookonomics"
              description="Bir asar, uch bosqich, bitta yakuniy muhokama."
              action={<Link href="/books" className="btn btn-secondary btn-sm">Kutubxona</Link>}
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <CoverArt
                    from={cycle.book.coverFrom}
                    to={cycle.book.coverTo}
                    title={cycle.book.title}
                    author={cycle.book.author}
                    variant="lines"
                    compact
                    className="h-[210px] w-[148px] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <Badge tone="accent">O‘qilmoqda</Badge>
                    <h3 className="mt-3 font-serif text-[26px] leading-tight">{cycle.book.title}</h3>
                    <p className="mt-1 text-[13px] text-[color:var(--color-muted)]">
                      {cycle.book.author}
                      {cycle.book.year ? ` · ${cycle.book.year}` : ""}
                      {cycle.book.pages ? ` · ${cycle.book.pages} bet` : ""}
                    </p>
                    <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">
                      {cycle.book.description}
                    </p>
                    <div className="mt-5">
                      <div className="mb-1.5 flex items-center justify-between text-[12px]">
                        <span className="text-[color:var(--color-muted)]">Hamjamiyat progressi</span>
                        <span className="font-semibold">{community.average}%</span>
                      </div>
                      <ProgressBar value={community.average} />
                      <p className="mt-2 text-[11.5px] text-[color:var(--color-muted)]">{community.readers} o‘quvchi qatnashmoqda</p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href="/app/read" className="btn btn-accent btn-sm">Progressni yangilash</Link>
                      <Link href="/app/discussions" className="btn btn-secondary btn-sm">Muhokama</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-6">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Bosqichlar</h3>
                <ol className="mt-4 space-y-4">
                  {cycle.milestones.map((m, i) => (
                    <li key={m.id} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--club-accent)] text-[11px] font-semibold text-[color:var(--club-accent-ink)]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[13.5px] font-medium">{m.title}</p>
                        <p className="mt-0.5 text-[12px] text-[color:var(--color-muted)]">{formatDate(m.dueAt)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 rounded-[10px] bg-[#f7f8fa] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Yakuniy uchrashuv</p>
                  <p className="mt-1.5 text-[13.5px] font-medium">
                    {cycle.meetingAt ? formatDate(cycle.meetingAt, "d MMMM, HH:mm") : "—"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[color:var(--color-muted)]">{cycle.location}</p>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">O‘qilgan asarlar</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {history.map((h) => (
                    <BookRow key={h.id} book={h.book} meta={`Yakunlangan · ${h.endsAt ? formatDate(h.endsAt) : ""}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* events */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading
          eyebrow="Taqvim"
          title="Klub tadbirlari"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <CalendarSubscribe club={club.slug} compact />
              <Link href="/events" className="btn btn-ghost btn-sm">Barchasi <ArrowRight size={14} /></Link>
            </div>
          }
        />
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {events.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
          {past.map((e) => (
            <div key={e.id} className="opacity-70">
              <EventRow event={e} compact />
            </div>
          ))}
        </div>
        {events.length === 0 && past.length === 0 && (
          <p className="mt-6 text-sm text-[color:var(--color-muted)]">Hozircha tadbir e’lon qilinmagan.</p>
        )}
      </section>

      {/* telegram channel mirror */}
      {feed.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
          <SectionHeading
            eyebrow="Telegram"
            title="Kanaldagi so‘nggi postlar"
            description="Klub hayoti asosan Telegramda kechadi — eng muhim e’lonlar shu yerda ham ko‘rinadi."
            action={
              club.telegramUrl ? (
                <a href={club.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  Kanalga o‘tish <ArrowRight size={14} />
                </a>
              ) : null
            }
          />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {feed.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col rounded-[14px] border border-[color:var(--color-line)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-line-strong)] hover:shadow-[var(--shadow-card)]"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                  {post.publishedAt ? formatDate(post.publishedAt, "d MMMM, HH:mm") : "Telegram"}
                </span>
                <p className="mt-3 line-clamp-6 whitespace-pre-line text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">
                  {post.text}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[12px] font-semibold text-[color:var(--color-ink)] group-hover:text-[var(--club-accent)]">
                  Kanalda o‘qish <ArrowRight size={13} />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* team */}
      {club.memberships.length > 0 && (
        <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-surface-2)]">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
            <SectionHeading eyebrow="Jamoa" title="Klub rahbariyati" />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                {club.memberships.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-[12px] border border-[color:var(--color-line)] bg-white p-4">
                    <Avatar first={m.user.firstName} last={m.user.lastName} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold">
                        {m.user.firstName} {m.user.lastName}
                      </p>
                      <p className="text-[11.5px] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
                        {m.role === "PRESIDENT" ? "Prezident" : "Menejer"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {leaders.length > 0 && (
                <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      Faol a’zolar
                    </p>
                    <span className="text-[11px] text-[color:var(--color-muted-soft)]">ball</span>
                  </div>
                  <ol className="mt-3 space-y-2.5">
                    {leaders.map((leader, index) => (
                      <li key={leader.id} className="flex items-center gap-2.5">
                        <span className="w-4 text-[11px] font-semibold tabular-nums text-[color:var(--color-muted-soft)]">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-medium text-[color:var(--color-ink)]">
                            {leader.user.firstName} {leader.user.lastName ?? ""}
                          </span>
                          <span className="mt-1 block h-[4px] overflow-hidden rounded-full bg-[color:var(--color-surface-3)]">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.max(6, Math.round((leader.user.points / topPoints) * 100))}%`,
                                background: club.accent,
                              }}
                            />
                          </span>
                        </span>
                        <span className="w-8 text-right text-[11.5px] font-semibold tabular-nums text-[color:var(--color-ink-soft)]">
                          {leader.user.points}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* related */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Yana" title="Boshqa klublar" action={<Link href="/clubs" className="btn btn-ghost btn-sm">Katalog <ArrowRight size={14} /></Link>} />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {related.map((p) => (
            <Link
              key={p.slug}
              href={`/clubs/${p.slug}`}
              className="group rounded-[14px] border border-[color:var(--color-line)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
            >
              <ClubLogo name={p.name} logoUrl={p.logoUrl} accent={p.accent} size={36} rounded="rounded-[8px]" />
              <h3 className="mt-3 font-serif text-[18px]">{p.name}</h3>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[color:var(--color-muted)]">{p.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
