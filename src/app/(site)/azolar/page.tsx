import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Crown, Search, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Avatar } from "@/components/ui/primitives";
import { ClubLogo } from "@/components/ui/club-logo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "A’zolar",
  description: "TDIU klublari a’zolari: kim qaysi klubda, kim rahbar va kim faol.",
};

/**
 * People directory.
 *
 * CampusGroups and Engage both ship one, and it is the reason a directory beats a
 * list of clubs: "who is in the debate club" is a real question before a first
 * meeting. The privacy line here: leadership is already named publicly on club
 * pages, so it is shown in full; ordinary members appear as first name + initial
 * of the surname. A signed-in member sees the same view — the platform does not
 * quietly publish a full student list to the open web.
 */
function publicName(firstName: string, lastName: string | null, full: boolean) {
  if (full || !lastName) return [firstName, lastName].filter(Boolean).join(" ");
  return `${firstName} ${lastName.trim().charAt(0).toUpperCase()}.`;
}

export default async function MembersDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ club?: string; q?: string }>;
}) {
  const params = await searchParams;
  const user = await getSession();
  const query = (params.q ?? "").trim().toLowerCase();

  const memberships = await db.membership.findMany({
    where: {
      status: "ACTIVE",
      ...(params.club ? { club: { slug: params.club } } : {}),
      ...(query
        ? {
            user: {
              OR: [
                { firstName: { contains: query } },
                { lastName: { contains: query } },
              ],
            },
          }
        : {}),
    },
    orderBy: [{ club: { sortOrder: "asc" } }, { role: "asc" }, { joinedAt: "asc" }],
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: { id: true, firstName: true, lastName: true, points: true, photoUrl: true } },
      club: { select: { id: true, name: true, slug: true, accent: true, logoUrl: true } },
    },
    take: 400,
  });

  // Only clubs that actually have members get a facet: an empty chip is a dead
  // end, and the directory is meant to answer questions, not to prove it has 22
  // rows. The count sits in the chip so the reader knows what they are opening.
  const perClub = await db.membership.groupBy({
    by: ["clubId"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
  });
  const countByClub = new Map(perClub.map((row) => [row.clubId, row._count._all]));
  const clubs = (
    await db.club.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    })
  )
    .filter((club) => (countByClub.get(club.id) ?? 0) > 0)
    .sort((a, b) => (countByClub.get(b.id) ?? 0) - (countByClub.get(a.id) ?? 0));

  // group by club, keeping the query order
  const groups = new Map<string, { club: (typeof memberships)[number]["club"]; rows: typeof memberships }>();
  for (const row of memberships) {
    const bucket = groups.get(row.club.id) ?? { club: row.club, rows: [] as typeof memberships };
    bucket.rows.push(row);
    groups.set(row.club.id, bucket);
  }
  // A student can belong to several clubs, so the headline counts people, not
  // rows: "54 memberships" would overstate the campus.
  const total = memberships.length;
  const people = new Set(memberships.map((row) => row.user.id)).size;
  const leaders = memberships.filter((row) => row.role !== "MEMBER").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <div className="eyebrow">Jamoa</div>
        <h1 className="display mt-3 text-[36px] leading-tight sm:text-[44px]">A’zolar</h1>
        <p className="lede mt-3 max-w-xl">
          {groups.size} klub, {people} nafar talaba. Rahbarlar to‘liq ismi bilan, oddiy a’zolar ism va
          familiya bosh harfi bilan ko‘rsatiladi.
        </p>
      </div>

      <form action="/azolar" className="mt-8 flex flex-wrap items-center gap-2">
        {params.club ? <input type="hidden" name="club" value={params.club} /> : null}
        <label className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted-soft)]"
          />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Ism bo‘yicha qidirish"
            className="input !pl-9"
            aria-label="A’zoni ism bo‘yicha qidirish"
          />
        </label>
        <button className="btn btn-secondary">Qidirish</button>
        {query || params.club ? (
          <Link href="/azolar" className="btn btn-ghost btn-sm">
            Tozalash
          </Link>
        ) : null}
      </form>

      <div className="hide-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1">
        <Link
          href="/azolar"
          className={cn(
            "whitespace-nowrap rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
            !params.club
              ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
              : "border-[color:var(--color-line)] bg-[color:var(--color-surface)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-line-strong)]",
          )}
        >
          Barchasi
        </Link>
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/azolar?club=${club.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
              params.club === club.slug
                ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                : "border-[color:var(--color-line)] bg-[color:var(--color-surface)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-line-strong)]",
            )}
          >
            {club.name}
            <span className="ml-1.5 text-[10.5px] tabular-nums opacity-60">{countByClub.get(club.id)}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] text-[color:var(--color-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <Users size={13} /> {people} talaba · {total} a’zolik
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Crown size={13} /> {leaders} rahbar
        </span>
      </div>

      {groups.size === 0 ? (
        <div className="mt-10 rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-6 py-14 text-center">
          <Users size={20} className="mx-auto text-[color:var(--color-muted-soft)]" />
          <p className="mt-3 text-[13.5px] font-semibold text-[color:var(--color-ink)]">Hech kim topilmadi</p>
          <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
            Boshqa ism yoki klubni sinab ko‘ring. Klublar katalogidan ham qidirish mumkin.
          </p>
          <Link href="/clubs" className="btn btn-secondary btn-sm mt-5">
            Klublar katalogi <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {[...groups.values()].map(({ club, rows }) => (
            <section key={club.id}>
              <div className="flex items-center gap-3 border-b border-[color:var(--color-line)] pb-3">
                <ClubLogo name={club.name} logoUrl={club.logoUrl} accent={club.accent} size={32} />
                <Link
                  href={`/clubs/${club.slug}`}
                  className="font-serif text-[17px] text-[color:var(--color-ink)] transition-colors hover:text-[color:var(--color-green)]"
                >
                  {club.name}
                </Link>
                <span className="text-[11.5px] tabular-nums text-[color:var(--color-muted)]">{rows.length} a’zo</span>
                <Link href={`/clubs/${club.slug}`} className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-[color:var(--color-link)]">
                  Klub sahifasi <ArrowRight size={12} />
                </Link>
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => {
                  const leader = row.role !== "MEMBER";
                  return (
                    <li
                      key={row.id}
                      className="flex items-center gap-3 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3 py-2.5"
                    >
                      <Avatar first={row.user.firstName} last={row.user.lastName} size={32} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-semibold text-[color:var(--color-ink)]">
                          {publicName(row.user.firstName, row.user.lastName, leader)}
                        </span>
                        <span className="block text-[11px] text-[color:var(--color-muted)]">
                          {row.role === "PRESIDENT" ? "Prezident" : row.role === "MANAGER" ? "Menejer" : "A’zo"}
                          {row.user.points > 0 ? ` · ${row.user.points} ball` : ""}
                        </span>
                      </span>
                      {leader ? (
                        <Crown size={13} className="shrink-0 text-[color:var(--color-brass)]" aria-hidden />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {!user ? (
        <p className="mt-10 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-4 py-3 text-[12px] leading-relaxed text-[color:var(--color-muted)]">
          O‘zingizni ro‘yxatda ko‘rmasangiz, klub sahifasidan ariza topshiring — tasdiqlangach shu
          yerda paydo bo‘lasiz.
        </p>
      ) : null}
    </div>
  );
}
