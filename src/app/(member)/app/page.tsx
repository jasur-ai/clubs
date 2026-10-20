import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Flame, MessagesSquare } from "lucide-react";
import { requireUserPage } from "@/lib/session";
import { db } from "@/lib/db";
import { getCurrentCycle } from "@/lib/queries";
import { ProgressBar, Avatar } from "@/components/ui/primitives";
import { formatDate, relativeDate, timeRange } from "@/lib/format";
import { CoverArt } from "@/components/ui/cover-art";

export default async function AppHome() {
  const user = await requireUserPage();

  const membership = await db.membership.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: { club: true },
    orderBy: { joinedAt: "asc" },
  });

  const club = membership?.club;

  const [cycle, progress, upcoming, threads, notifications] = await Promise.all([
    club ? getCurrentCycle(club.id) : null,
    club
      ? db.readingProgress.findFirst({
          where: { userId: user.id, cycle: { clubId: club.id, status: "READING" } },
        })
      : null,
    club
      ? db.event.findMany({
          where: { clubId: club.id, status: "PUBLISHED", startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 2,
          include: { _count: { select: { rsvps: true } }, rsvps: { where: { userId: user.id } } },
        })
      : [],
    club
      ? db.discussionThread.findMany({
          where: { clubId: club.id },
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          take: 3,
          include: { _count: { select: { posts: true } }, author: { select: { firstName: true } } },
        })
      : [],
    db.notification.findMany({ where: { userId: user.id, readAt: null }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const readerCount = cycle?.progress.length ?? 0;
  const teamAvg = readerCount ? Math.round(cycle!.progress.reduce((s, p) => s + p.percent, 0) / readerCount) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11.5px] text-[color:var(--color-muted)]">{relativeDate(new Date())}</p>
          <h1 className="mt-0.5 font-serif text-[25px] leading-tight">Salom, {user.firstName}</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[color:var(--color-muted)] ring-1 ring-[color:var(--color-line)]">
          <Flame size={13} className="text-[#a8492f]" /> {user.points} ball
        </div>
      </div>

      {!club && (
        <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-5 text-center">
          <p className="text-[14px] font-semibold">Hali klubga a’zo emassiz</p>
          <p className="mt-1 text-[12.5px] text-[color:var(--color-muted)]">Klub tanlab, ariza topshiring.</p>
          <Link href="/clubs" className="btn btn-primary btn-sm mt-4">Klublar</Link>
        </div>
      )}

      {cycle && (
        <div className="overflow-hidden rounded-[16px] border border-[color:var(--color-line)] bg-white">
          <div className="flex gap-3.5 p-4">
            <CoverArt from={cycle.book.coverFrom} to={cycle.book.coverTo} title={cycle.book.title} author={cycle.book.author} label="Kitob" variant="lines" className="h-[92px] w-[68px] shrink-0 rounded-[6px]" compact />
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Hozir o‘qilmoqda</p>
              <p className="mt-1 truncate font-serif text-[17px] leading-tight">{cycle.book.title}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-[color:var(--color-muted)]">{cycle.book.author}</p>
              <div className="mt-2.5">
                <ProgressBar value={progress?.percent ?? 0} />
                <div className="mt-1 flex justify-between text-[10.5px] text-[color:var(--color-muted)]">
                  <span>{progress ? `${progress.percent}% o‘qildi` : "Boshlanmagan"}</span>
                  <span>{cycle.book.pages ?? "—"} bet</span>
                </div>
              </div>
            </div>
          </div>
          <Link href="/app/read" className="flex items-center justify-between border-t border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-4 py-2.5 text-[12px] font-semibold">
            <span>Progressni yangilash</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="O‘quvchilar" value={String(readerCount)} icon={<BookOpen size={14} />} />
        <MiniStat label="O‘rtacha" value={`${teamAvg}%`} icon={<Flame size={14} />} />
        <MiniStat label="Tadbirlar" value={String(upcoming.length)} icon={<CalendarDays size={14} />} />
      </div>

      {notifications.length > 0 && (
        <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white">
          {notifications.map((n) => (
            <Link key={n.id} href={n.url ?? "#"} className="block border-b border-[color:var(--color-line)] px-4 py-3 last:border-0">
              <p className="text-[12.5px] font-semibold">{n.title}</p>
              {n.body && <p className="mt-0.5 line-clamp-2 text-[11.5px] text-[color:var(--color-muted)]">{n.body}</p>}
            </Link>
          ))}
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Keyingi tadbirlar</h2>
          <Link href="/app/events" className="text-[11.5px] font-semibold text-[color:var(--color-muted)]">Barchasi</Link>
        </div>
        <div className="space-y-2">
          {upcoming.map((e) => {
            const mine = e.rsvps[0];
            return (
              <Link key={e.id} href={`/events/${e.id}`} className="block rounded-[12px] border border-[color:var(--color-line)] bg-white p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold leading-snug">{e.title}</p>
                    <p className="mt-1 text-[11.5px] text-[color:var(--color-muted)]">
                      {formatDate(e.startsAt, "d MMM")} · {timeRange(e.startsAt, e.endsAt)} · {e.location}
                    </p>
                  </div>
                  {mine && (
                    <span className="shrink-0 rounded-full bg-[#eef7f0] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-success)]">
                      {mine.status === "GOING" ? "Boraman" : "Ehtimol"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
          {upcoming.length === 0 && <p className="rounded-[12px] border border-dashed border-[color:var(--color-line-strong)] bg-white p-4 text-center text-[12px] text-[color:var(--color-muted)]">Yaqin tadbir yo‘q.</p>}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Muhokamalar</h2>
          <Link href="/app/discussions" className="text-[11.5px] font-semibold text-[color:var(--color-muted)]">Barchasi</Link>
        </div>
        <div className="overflow-hidden rounded-[12px] border border-[color:var(--color-line)] bg-white">
          {threads.map((t) => (
            <Link key={t.id} href={`/app/discussions/${t.id}`} className="flex items-center gap-3 border-b border-[color:var(--color-line)] px-3.5 py-3 last:border-0">
              <MessagesSquare size={15} className="shrink-0 text-[color:var(--color-muted)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium">{t.title}</p>
                <p className="mt-0.5 text-[10.5px] text-[color:var(--color-muted)]">
                  {t.author?.firstName ?? "TDIU"} · {t._count.posts} javob
                </p>
              </div>
            </Link>
          ))}
          {threads.length === 0 && <p className="p-4 text-center text-[12px] text-[color:var(--color-muted)]">Hozircha mavzu yo‘q — birinchi bo‘ling.</p>}
        </div>
      </section>

      {club && (
        <div className="flex items-center gap-3 rounded-[14px] bg-[color:var(--color-plate)] p-4 text-white">
          <Avatar first={user.firstName} last={user.lastName} src={user.photoUrl} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold">{club.name}</p>
            <p className="text-[11px] text-white/60">A’zo · {membership?.role === "MEMBER" ? "talaba" : membership?.role.toLowerCase()}</p>
          </div>
          <Link href="/app/profile" className="text-[11.5px] font-semibold text-white/80">Profil</Link>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--color-line)] bg-white p-3">
      <span className="text-[color:var(--color-muted)]">{icon}</span>
      <p className="mt-1.5 font-serif text-[19px] leading-none">{value}</p>
      <p className="mt-1 text-[10px] text-[color:var(--color-muted)]">{label}</p>
    </div>
  );
}
