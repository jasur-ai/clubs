import Link from "next/link";
import { ArrowUpRight, Bell, BellOff, CheckCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireUserPage } from "@/lib/session";
import { markNotificationsReadAction } from "@/app/actions/member";
import { relativeDate } from "@/lib/format";

export const metadata = { title: "Bildirishnomalar" };

/**
 * Notification centre.
 *
 * The bell used to lead to the profile page, which made the badge a dead end.
 * Everything that happens to a member — an approved application, a freed place
 * on a waitlist, a new discussion — lands here with the action to take next.
 */
export default async function NotificationsPage() {
  const user = await requireUserPage("/app/bildirishnomalar");

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = notifications.filter((item) => !item.readAt).length;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11.5px] text-[color:var(--color-muted)]">Xabarlar</p>
          <h1 className="mt-0.5 font-serif text-[24px] leading-tight">Bildirishnomalar</h1>
        </div>
        {unread > 0 && (
          <form action={markNotificationsReadAction}>
            <button className="btn btn-secondary btn-sm">
              <CheckCheck size={13} /> O‘qilgan ({unread})
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-5 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-muted)]">
            <BellOff size={17} strokeWidth={1.7} />
          </span>
          <p className="mt-3 text-[14px] font-semibold">Hozircha xabar yo‘q</p>
          <p className="mx-auto mt-1 max-w-[280px] text-[12px] leading-relaxed text-[color:var(--color-muted)]">
            Ariza tasdiqlanganda, navbatdagi joy bo‘shaganda yoki klub yangilik e’lon qilganda shu yerda ko‘rinadi.
          </p>
          <Link href="/app/events" className="btn btn-secondary btn-sm mt-4">
            Tadbirlarni ko‘rish
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((item) => (
            <li
              key={item.id}
              className={`rounded-[12px] border p-3.5 ${
                item.readAt
                  ? "border-[color:var(--color-line)] bg-[color:var(--color-surface)]"
                  : "border-[color:color-mix(in_oklab,var(--club-accent)_28%,var(--color-line))] bg-[color:color-mix(in_oklab,var(--club-accent)_6%,var(--color-surface))]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    item.readAt ? "bg-[color:var(--color-surface-3)] text-[color:var(--color-muted)]" : "bg-[color:var(--club-accent)] text-white"
                  }`}
                >
                  <Bell size={13} strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-snug text-[color:var(--color-ink)]">{item.title}</p>
                  {item.body && (
                    <p className="mt-0.5 text-[12px] leading-relaxed text-[color:var(--color-muted)]">{item.body}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[color:var(--color-muted-soft)]">
                    <span>{relativeDate(item.createdAt)}</span>
                    {item.url && (
                      <Link href={item.url} className="inline-flex items-center gap-1 font-semibold text-[color:var(--color-link)]">
                        Ochish <ArrowUpRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
