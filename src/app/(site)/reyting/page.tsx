import type { Metadata } from "next";
import Link from "next/link";
import { Award, Flame, Medal, Users } from "lucide-react";
import { db } from "@/lib/db";
import { CATEGORY_LABELS, type ClubCategory } from "@/config/clubs";

export const metadata: Metadata = {
  title: "Reyting",
  description: "TDIU klublari faollik reytingi: ball to‘plagan talabalar va eng faol klublar.",
};

export const dynamic = "force-dynamic";

/** Points earned by reading, attending and giving feedback — the visible half of gamification. */
export default async function LeaderboardPage() {
  const [topUsers, clubs] = await Promise.all([
    db.user.findMany({
      where: { points: { gt: 0 } },
      orderBy: { points: "desc" },
      take: 20,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        points: true,
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
          select: { club: { select: { name: true, accent: true, slug: true } } },
        },
      },
    }),
    db.club.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        accent: true,
        category: true,
        _count: { select: { memberships: true, events: true, books: true } },
      },
    }),
  ]);

  const clubRanking = clubs
    .map((club) => ({
      ...club,
      score: club._count.memberships * 3 + club._count.events * 2 + club._count.books,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const maxScore = Math.max(1, ...clubRanking.map((club) => club.score));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="eyebrow">Jadval</div>
      <h1 className="display mt-3 text-[34px] leading-tight sm:text-[42px]">Reyting</h1>
      <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-[color:var(--color-muted)]">
        Ball o‘qish, tadbirda qatnashish va fikr bildirish uchun beriladi. Jadvallar har kuni yangilanadi —
        bu shunchaki raqam emas, klub hayotidagi haqiqiy ishtirok o‘lchovi.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.56fr_0.44fr]">
        <section>
          <div className="flex items-center gap-2 border-b border-[color:var(--color-line)] pb-2.5">
            <Flame size={14} className="text-[color:var(--color-clay)]" strokeWidth={1.9} />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
              Eng faol talabalar
            </h2>
          </div>

          {topUsers.length === 0 ? (
            <p className="py-6 text-[13px] text-[color:var(--color-muted)]">Hali ball to‘planmagan.</p>
          ) : (
            <ol className="divide-y divide-[color:var(--color-line)]">
              {topUsers.map((user, index) => {
                const club = user.memberships[0]?.club;
                const medal = index === 0 ? "text-[color:var(--color-brass)]" : index < 3 ? "text-[color:var(--color-ink-soft)]" : "text-[color:var(--color-muted-soft)]";
                return (
                  <li key={user.id} className="flex items-center gap-3 py-3">
                    <span className="w-6 shrink-0 text-[12px] font-semibold tabular-nums text-[color:var(--color-muted)]">
                      {index < 3 ? <Medal size={15} className={medal} strokeWidth={1.9} /> : String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-[color:var(--color-ink)]">
                        {user.firstName} {user.lastName ? `${user.lastName.slice(0, 1)}.` : ""}
                      </p>
                      {club && (
                        <Link href={`/clubs/${club.slug}`} className="inline-flex items-center gap-1.5 text-[11.5px] text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: club.accent }} />
                          {club.name}
                        </Link>
                      )}
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[color:var(--color-ink)]">
                      {user.points}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 border-b border-[color:var(--color-line)] pb-2.5">
            <Award size={14} strokeWidth={1.9} className="text-[color:var(--color-muted)]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
              Klublar reytingi
            </h2>
          </div>

          <ol className="mt-3 space-y-3">
            {clubRanking.map((club, index) => (
              <li key={club.slug}>
                <Link href={`/clubs/${club.slug}`} className="group block">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2 text-[13px] text-[color:var(--color-ink-soft)] transition-colors group-hover:text-[color:var(--color-ink)]">
                      <span className="w-4 text-[11px] tabular-nums text-[color:var(--color-muted)]">{index + 1}</span>
                      {club.name}
                    </span>
                    <span className="text-[11.5px] tabular-nums text-[color:var(--color-muted)]">
                      <Users size={10} className="mr-1 inline" />
                      {club._count.memberships}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-surface-3)]">
                    <span
                      className="block h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${Math.max(5, (club.score / maxScore) * 100)}%`, background: club.accent }}
                    />
                  </div>
                  <p className="mt-1 text-[10.5px] text-[color:var(--color-muted-soft)]">
                    {CATEGORY_LABELS[club.category as ClubCategory] ?? club.category} · {club._count.events} tadbir ·{" "}
                    {club._count.books} kitob
                  </p>
                </Link>
              </li>
            ))}
          </ol>

          <p className="mt-6 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] p-3.5 text-[11.5px] leading-relaxed text-[color:var(--color-muted)]">
            Hisob raqamlari ochiq ko‘rsatilmaydi — faqat ism va familiyaning bosh harfi.
          </p>
        </section>
      </div>
    </div>
  );
}
