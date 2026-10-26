import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays, Inbox, Users } from "lucide-react";
import { managedClubIds } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { BarList, ColumnChart } from "@/components/admin/analytics";
import { formatDate as fmt } from "@/lib/format";
import { formatDate, timeRange } from "@/lib/format";

export const metadata = { title: "Boshqaruv paneli" };

export default async function AdminDashboard() {
  const user = await requireStaffPage();
  const scope = await managedClubIds(user);
  const whereClub = scope === "all" ? {} : { clubId: { in: scope } };

  const [pending, members, upcoming, requests, events, readings, audit] = await Promise.all([
    db.joinRequest.count({ where: { status: "NEW", ...whereClub } }),
    db.membership.count({ where: { status: "ACTIVE", ...whereClub } }),
    db.event.count({ where: { status: "PUBLISHED", startsAt: { gte: new Date() }, ...whereClub } }),
    db.joinRequest.findMany({
      where: { ...whereClub },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { club: { select: { name: true, accent: true } } },
    }),
    db.event.findMany({
      where: { startsAt: { gte: new Date() }, ...whereClub },
      orderBy: { startsAt: "asc" },
      take: 4,
      include: { club: { select: { name: true } }, _count: { select: { rsvps: true } } },
    }),
    db.readingCycle.findMany({
      where: { status: "READING", ...whereClub },
      include: { club: { select: { name: true } }, book: true, _count: { select: { progress: true } } },
      take: 4,
    }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { actor: { select: { firstName: true, lastName: true } } } }),
  ]);

  // ---- analytics -----------------------------------------------------------
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - 13);

  const [recentRequests, clubMembers, rsvpByEvent] = await Promise.all([
    db.joinRequest.findMany({
      where: { createdAt: { gte: from }, ...whereClub },
      select: { createdAt: true },
    }),
    db.membership.groupBy({
      by: ["clubId"],
      where: { status: "ACTIVE", ...whereClub },
      _count: true,
    }),
    db.event.findMany({
      where: { startsAt: { gte: new Date() }, status: "PUBLISHED", ...whereClub },
      orderBy: { startsAt: "asc" },
      take: 5,
      select: { title: true, _count: { select: { rsvps: true } } },
    }),
  ]);

  const dayBuckets = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(from);
    day.setDate(from.getDate() + index);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const value = recentRequests.filter((request) => request.createdAt >= day && request.createdAt < next).length;
    return { label: fmt(day, "d MMM"), value, hint: `${fmt(day, "d MMM")} — ${value} ariza` };
  });

  const clusterNames = await db.club.findMany({
    where: scope === "all" ? { isActive: true } : { id: { in: scope } },
    select: { id: true, name: true, accent: true },
  });
  const clubRows = clubMembers
    .map((row) => {
      const club = clusterNames.find((item) => item.id === row.clubId);
      return { label: club?.name ?? "—", value: row._count, accent: club?.accent ?? null };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const stats = [
    { label: "Kutilayotgan so‘rov", value: pending, icon: Inbox, href: "/admin/join-requests", accent: pending > 0 },
    { label: "Faol a’zolar", value: members, icon: Users, href: "/admin/members" },
    { label: "Rejadagi tadbirlar", value: upcoming, icon: CalendarDays, href: "/admin/events" },
    { label: "Faol o‘qish davri", value: readings.length, icon: BookOpen, href: "/admin/reading" },
  ];

  return (
    <div>
      <PageHeader
        title={`Salom, ${user.firstName}`}
        description="Bugungi holat: so‘rovlar, tadbirlar va o‘qish dasturi."
        action={<Link href="/admin/join-requests" className="btn btn-primary btn-sm">So‘rovlarni ko‘rish</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="group rounded-[12px] border border-[color:var(--color-line)] bg-white p-4 transition-colors hover:border-[color:var(--color-line-strong)]">
              <div className="flex items-center justify-between">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] ${s.accent ? "bg-[#fdf3e7] text-[color:var(--color-warning)]" : "bg-[color:var(--color-surface-3)] text-[color:var(--color-link)]"}`}>
                  <Icon size={15} />
                </span>
                <ArrowUpRight size={14} className="text-[color:var(--color-muted-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 font-serif text-[30px] leading-none">{s.value}</p>
              <p className="mt-1.5 text-[11.5px] text-[color:var(--color-muted)]">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Arizalar oqimi" meta="So‘nggi 14 kun">
          <div className="p-4">
            <ColumnChart
              title="Kunlik arizalar"
              meta={`${recentRequests.length} ta · 14 kun`}
              points={dayBuckets}
              unit="ariza"
            />
          </div>
        </Panel>
        <Panel title="Klublar kesimi" meta={`${clubRows.reduce((sum, row) => sum + row.value, 0)} a’zo`}>
          <div className="p-4">
            <BarList title="Faol a’zolar" rows={clubRows} empty="Hozircha a’zo yo‘q" />
          </div>
        </Panel>
        <Panel title="Tadbirlarga qiziqish" meta="Yaqin 5 tadbir">
          <div className="p-4">
            <BarList
              title="RSVP"
              rows={rsvpByEvent.map((event) => ({ label: event.title, value: event._count.rsvps }))}
              empty="Hozircha RSVP yo‘q"
            />
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="So‘nggi arizalar" action={<Link href="/admin/join-requests" className="text-[11.5px] font-semibold text-[color:var(--color-link)]">Barchasi</Link>}>
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 border-b border-[color:var(--color-line)] px-4 py-3 last:border-0">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.club.accent }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold">{r.fullName}</p>
                <p className="text-[11px] text-[color:var(--color-muted)]">{r.club.name} · {formatDate(r.createdAt, "d MMM, HH:mm")}</p>
              </div>
              <StatusPill status={r.status} />
            </div>
          ))}
          {requests.length === 0 && <p className="px-4 py-6 text-center text-[12px] text-[color:var(--color-muted)]">Yangi ariza yo‘q.</p>}
        </Panel>

        <Panel title="Yaqin tadbirlar">
          {events.map((e) => (
            <div key={e.id} className="border-b border-[color:var(--color-line)] px-4 py-3 last:border-0">
              <p className="text-[12.5px] font-semibold leading-snug">{e.title}</p>
              <p className="mt-0.5 text-[11px] text-[color:var(--color-muted)]">
                {formatDate(e.startsAt, "d MMM")} · {timeRange(e.startsAt, e.endsAt)} · {e.club.name}
              </p>
              <p className="text-[10.5px] text-[color:var(--color-muted-soft)]">{e._count.rsvps} RSVP</p>
            </div>
          ))}
          {events.length === 0 && <p className="px-4 py-6 text-center text-[12px] text-[color:var(--color-muted)]">Rejadagi tadbir yo‘q.</p>}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="O‘qish davrlari" meta="faol">
          {readings.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 border-b border-[color:var(--color-line)] px-4 py-3 last:border-0">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold">{c.book.title}</p>
                <p className="text-[11px] text-[color:var(--color-muted)]">{c.club.name} · {c.book.author}</p>
              </div>
              <span className="shrink-0 text-[11px] text-[color:var(--color-muted)]">{c._count.progress} o‘quvchi</span>
            </div>
          ))}
          {readings.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-[12px] text-[color:var(--color-muted)]">Faol davr yo‘q.</p>
              <Link href="/admin/reading" className="btn btn-secondary btn-sm mt-3">Davr boshlash</Link>
            </div>
          )}
        </Panel>

        <Panel title="Audit jurnali">
          {audit.map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-2.5 last:border-0">
              <div>
                <p className="text-[11.5px] font-medium">{a.action}</p>
                <p className="text-[10.5px] text-[color:var(--color-muted)]">
                  {a.actor ? `${a.actor.firstName} ${a.actor.lastName ?? ""}` : "Tizim"} · {a.entity}
                </p>
              </div>
              <span className="text-[10.5px] text-[color:var(--color-muted-soft)]">{formatDate(a.createdAt, "d MMM, HH:mm")}</span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
