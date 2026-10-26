import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Download, MapPin, UserCheck, Users } from "lucide-react";
import { canManageClub } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { toggleAttendanceAction } from "@/app/actions/admin";
import { PageHeader, Panel } from "@/components/admin/ui";
import { Avatar } from "@/components/ui/primitives";
import { formatDate, timeRange } from "@/lib/format";

export const metadata = { title: "Davomat" };

/**
 * Door list.
 *
 * Club leads run attendance from a phone in the doorway: the list has to show
 * who is expected, be tappable with a thumb, and be undoable. Marks are stored
 * per RSVP and feed the member's points and the event's report.
 */
export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaffPage();

  const event = await db.event.findUnique({
    where: { id },
    include: {
      club: { select: { id: true, name: true, slug: true, accent: true } },
      rsvps: {
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        include: { user: { select: { id: true, firstName: true, lastName: true, photoUrl: true, username: true, email: true } } },
      },
    },
  });
  if (!event) notFound();
  if (!(await canManageClub(user, event.club.id))) notFound();

  const going = event.rsvps.filter((rsvp) => rsvp.status === "GOING");
  const waiting = event.rsvps.filter((rsvp) => rsvp.status === "WAITLIST");
  const maybe = event.rsvps.filter((rsvp) => rsvp.status === "MAYBE");
  const attended = event.rsvps.filter((rsvp) => rsvp.attendedAt);
  const rate = going.length + attended.length > 0 ? Math.round((attended.length / Math.max(going.length, 1)) * 100) : 0;

  const rows = [...going, ...waiting, ...maybe];

  return (
    <div style={{ "--club-accent": event.club.accent } as React.CSSProperties}>
      <PageHeader
        title="Davomat"
        back={{ href: "/admin/events", label: "← Tadbirlar" }}
        description={`${event.club.name} · ${formatDate(event.startsAt, "d MMMM, EEEE")} · ${timeRange(event.startsAt, event.endsAt)}`}
        action={
          <a href={`/api/admin/export?type=rsvps&club=${event.club.slug}`} className="btn btn-secondary btn-sm">
            <Download size={13} /> CSV
          </a>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat label="Boraman" value={going.length} icon={<Users size={13} />} />
        <Stat label="Navbat" value={waiting.length} icon={<Users size={13} />} />
        <Stat label="Keldi" value={attended.length} icon={<UserCheck size={13} />} />
        <Stat label="Qatnashish" value={`${rate}%`} icon={<Check size={13} />} />
      </div>

      <p className="mb-3 flex items-center gap-1.5 text-[11.5px] text-[color:var(--color-muted)]">
        <MapPin size={12} /> {event.location}
      </p>

      <Panel title="Ro‘yxat" meta={`${rows.length} ta`}>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-[12.5px] text-[color:var(--color-muted)]">
            Hozircha hech kim ro‘yxatdan o‘tmagan.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-line)]">
            {rows.map((rsvp) => {
              const checked = Boolean(rsvp.attendedAt);
              return (
                <li key={rsvp.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar first={rsvp.user.firstName} last={rsvp.user.lastName} src={rsvp.user.photoUrl} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-[color:var(--color-ink)]">
                      {rsvp.user.firstName} {rsvp.user.lastName ?? ""}
                    </p>
                    <p className="truncate text-[10.5px] text-[color:var(--color-muted)]">
                      {rsvp.status === "WAITLIST" ? "Navbatda" : rsvp.status === "MAYBE" ? "Ehtimol" : "Boraman"}
                      {rsvp.user.username ? ` · @${rsvp.user.username}` : ""}
                    </p>
                  </div>
                  <form action={toggleAttendanceAction}>
                    <input type="hidden" name="rsvpId" value={rsvp.id} />
                    <button
                      className={`inline-flex h-8 items-center gap-1.5 rounded-[8px] border px-3 text-[11.5px] font-semibold transition-colors ${
                        checked
                          ? "border-transparent bg-[color:var(--color-green)] text-white"
                          : "border-[color:var(--color-line-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-green)]"
                      }`}
                      aria-pressed={checked}
                    >
                      <Check size={13} strokeWidth={2.3} />
                      {checked ? "Keldi" : "Belgilash"}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <p className="mt-4 text-[11.5px] leading-relaxed text-[color:var(--color-muted)]">
        Belgilangan ishtirokchi 10 ball oladi; belgi olib tashlansa ball ham qaytariladi.{" "}
        <Link href={`/events/${event.id}`} className="font-semibold text-[color:var(--color-link)]">
          Ommaviy sahifa
        </Link>
      </p>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[11px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
        {icon} {label}
      </p>
      <p className="mt-1 font-serif text-[22px] leading-none tabular-nums text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}
