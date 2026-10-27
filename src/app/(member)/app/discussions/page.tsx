import Link from "next/link";
import { MessageSquare, Pin } from "lucide-react";
import { requireUserPage } from "@/lib/session";
import { db } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { NewThreadForm } from "@/components/app/new-thread-form";

export default async function DiscussionsPage() {
  const user = await requireUserPage();
  const memberships = await db.membership.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: { club: { select: { id: true, name: true } } },
    orderBy: { joinedAt: "asc" },
  });

  if (memberships.length === 0) {
    return (
      <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-6 text-center">
        <p className="font-serif text-[20px]">Muhokamalar klub a’zolari uchun</p>
        <Link href="/clubs" className="btn btn-primary btn-sm mt-4">Klub tanlash</Link>
      </div>
    );
  }

  const clubIds = memberships.map((m) => m.clubId);
  const threads = await db.discussionThread.findMany({
    where: { clubId: { in: clubIds } },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    include: {
      author: { select: { firstName: true, lastName: true } },
      club: { select: { name: true } },
      _count: { select: { posts: true } },
    },
    take: 40,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[24px]">Muhokamalar</h1>
        <NewThreadForm clubs={memberships.map((m) => ({ id: m.clubId, name: m.club.name }))} />
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[color:var(--color-line)] bg-white">
        {threads.map((t) => (
          <Link key={t.id} href={`/app/discussions/${t.id}`} className="block border-b border-[color:var(--color-line)] px-4 py-3.5 last:border-0 active:bg-[color:var(--color-surface-2)]">
            <div className="flex items-start gap-2">
              {t.isPinned && <Pin size={12} className="mt-1 shrink-0 text-[color:var(--club-accent-ink)]" />}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-snug">{t.title}</p>
                <p className="mt-1 line-clamp-1 text-[11.5px] text-[color:var(--color-muted)]">{t.body}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-[color:var(--color-muted)]">
                  <span>{t.author?.firstName ?? "TDIU"}</span>
                  <span>·</span>
                  <span>{relativeDate(t.updatedAt)}</span>
                  {t.kind === "QUESTION" && (
                    <span className="rounded-full bg-[#f3ede8] px-1.5 py-0.5 font-semibold text-[#7a4a33]">Savol</span>
                  )}
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[11px] text-[color:var(--color-muted)]">
                <MessageSquare size={12} /> {t._count.posts}
              </span>
            </div>
          </Link>
        ))}
        {threads.length === 0 && (
          <p className="p-6 text-center text-[12.5px] text-[color:var(--color-muted)]">
            Hozircha mavzu yo‘q. Kitob haqidagi birinchi fikrni yozing.
          </p>
        )}
      </div>
    </div>
  );
}
