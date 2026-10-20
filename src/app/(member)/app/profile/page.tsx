import Link from "next/link";
import { LogOut, Send, Trophy } from "lucide-react";
import { requireUserPage } from "@/lib/session";
import { db } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { markNotificationsReadAction } from "@/app/actions/member";
import { Avatar, ProgressBar } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";

export default async function ProfilePage() {
  const user = await requireUserPage();

  const [memberships, notifications, progressRows, rsvpCount] = await Promise.all([
    db.membership.findMany({
      where: { userId: user.id },
      include: { club: { select: { name: true, slug: true, accent: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    db.readingProgress.findMany({
      where: { userId: user.id },
      include: { cycle: { include: { book: { select: { title: true } } } } },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    db.eventRsvp.count({ where: { userId: user.id, status: "GOING" } }),
  ]);

  const activeClub = memberships[0]?.club;

  return (
    <div className="space-y-4">
      <div className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-5">
        <div className="flex items-center gap-3.5">
          <Avatar first={user.firstName} last={user.lastName} src={user.photoUrl} size={52} />
          <div className="min-w-0">
            <h1 className="truncate font-serif text-[21px] leading-tight">
              {user.firstName} {user.lastName ?? ""}
            </h1>
            <p className="mt-0.5 text-[11.5px] text-[color:var(--color-muted)]">
              {user.username ? `@${user.username}` : user.email}
            </p>
            <p className="mt-1 inline-flex rounded-full bg-[color:var(--color-surface-3)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-link)]">
              {user.role === "SUPER_ADMIN" ? "Platforma admini" : user.role === "CLUB_ADMIN" ? "Klub rahbari" : user.role === "EDITOR" ? "Muharrir" : "Talaba"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-[color:var(--color-line)] rounded-[10px] bg-[color:var(--color-surface-2)] py-3">
          <div className="px-3 text-center">
            <p className="font-serif text-[20px] leading-none">{user.points}</p>
            <p className="mt-1 text-[10px] text-[color:var(--color-muted)]">Ball</p>
          </div>
          <div className="px-3 text-center">
            <p className="font-serif text-[20px] leading-none">{rsvpCount}</p>
            <p className="mt-1 text-[10px] text-[color:var(--color-muted)]">Tadbir</p>
          </div>
          <div className="px-3 text-center">
            <p className="font-serif text-[20px] leading-none">{memberships.length}</p>
            <p className="mt-1 text-[10px] text-[color:var(--color-muted)]">Klub</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[color:var(--color-muted)]">
          <Trophy size={13} /> Har bir faollik ball bilan qayd etiladi
        </div>
      </div>

      {memberships.length > 0 && (
        <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white">
          <p className="border-b border-[color:var(--color-line)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
            A’zolik
          </p>
          {memberships.map((m) => (
            <Link key={m.id} href={`/clubs/${m.club.slug}`} className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-3 last:border-0">
              <span className="text-[12.5px] font-medium">{m.club.name}</span>
              <span className="text-[10.5px] text-[color:var(--color-muted)]">
                {m.status === "ACTIVE" ? "Faol" : m.status} · {formatDate(m.joinedAt, "MM.yyyy")}
              </span>
            </Link>
          ))}
        </div>
      )}

      {progressRows.length > 0 && (
        <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">O‘qish</p>
          <div className="mt-3 space-y-3">
            {progressRows.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between text-[11.5px]">
                  <span className="line-clamp-1 font-medium">{p.cycle.book.title}</span>
                  <span className="ml-2 shrink-0 text-[color:var(--color-muted)]">{p.percent}%</span>
                </div>
                <ProgressBar value={p.percent} className="mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white">
        <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Bildirishnomalar</p>
          <form action={markNotificationsReadAction}>
            <button className="text-[10.5px] font-semibold text-[color:var(--color-muted)]">O‘qilgan</button>
          </form>
        </div>
        {notifications.map((n) => (
          <Link key={n.id} href={n.url ?? "#"} className="block border-b border-[color:var(--color-line)] px-4 py-2.5 last:border-0">
            <p className="text-[12px] font-medium">{n.title}</p>
            <p className="text-[10px] text-[color:var(--color-muted)]">{formatDate(n.createdAt, "d MMM, HH:mm")}</p>
          </Link>
        ))}
        {notifications.length === 0 && <p className="px-4 py-4 text-[11.5px] text-[color:var(--color-muted)]">Bo‘sh.</p>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {activeClub && (
          <a href="https://t.me/tsuebookclub" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm gap-1.5">
            <Send size={13} /> Kanal
          </a>
        )}
        <form action={logoutAction} className={activeClub ? "" : "col-span-2"}>
          <button className="btn btn-ghost btn-sm w-full gap-1.5 text-[color:var(--color-muted)]">
            <LogOut size={13} /> Chiqish
          </button>
        </form>
      </div>
    </div>
  );
}
