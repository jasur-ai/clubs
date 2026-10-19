import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { requireUserPage } from "@/lib/session";
import { db } from "@/lib/db";
import { getCurrentCycle, getCycleHistory } from "@/lib/queries";
import { CoverArt } from "@/components/ui/cover-art";
import { ProgressBar } from "@/components/ui/primitives";
import { ProgressForm } from "@/components/app/progress-form";
import { formatDate } from "@/lib/format";

export default async function ReadPage() {
  const user = await requireUserPage();
  const membership = await db.membership.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: { club: true },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) {
    return (
      <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-6 text-center">
        <p className="font-serif text-[20px]">O‘qish dasturi klub a’zolari uchun</p>
        <Link href="/clubs" className="btn btn-primary btn-sm mt-4">Klub tanlash</Link>
      </div>
    );
  }

  const [cycle, history] = await Promise.all([getCurrentCycle(membership.clubId), getCycleHistory(membership.clubId, 4)]);
  const myProgress = cycle ? await db.readingProgress.findUnique({ where: { cycleId_userId: { cycleId: cycle.id, userId: user.id } } }) : null;

  if (!cycle) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-[24px]">O‘qish</h1>
        <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-6 text-center">
          <p className="text-[14px] font-semibold">Hozir faol o‘qish davri yo‘q</p>
          <p className="mt-1 text-[12.5px] text-[color:var(--color-muted)]">Keyingi kitob e’lon qilinganda shu yerda ko‘rinadi.</p>
        </div>
        <History history={history} />
      </div>
    );
  }

  const totalMilestones = cycle.milestones.length;
  const done = cycle.milestones.filter((m) => m.dueAt < new Date()).length;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Joriy davr</p>
        <h1 className="mt-1 font-serif text-[24px] leading-tight">{cycle.book.title}</h1>
        <p className="text-[12.5px] text-[color:var(--color-muted)]">{cycle.book.author}</p>
      </div>

      <div className="flex gap-4 rounded-[14px] border border-[color:var(--color-line)] bg-white p-3.5">
        <CoverArt from={cycle.book.coverFrom} to={cycle.book.coverTo} title={cycle.book.title} variant="lines" className="h-[104px] w-[78px] shrink-0 rounded-[6px]" compact />
        <div className="min-w-0 text-[12px] leading-relaxed text-[color:var(--color-muted)]">
          <p className="line-clamp-4">{cycle.book.description}</p>
          {cycle.meetingAt && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--color-ink-soft)]">
              <Clock size={11} /> {formatDate(cycle.meetingAt, "d MMM, HH:mm")} · {cycle.location ?? "TDIU"}
            </p>
          )}
        </div>
      </div>

      <ProgressForm cycleId={cycle.id} initial={myProgress?.percent ?? 0} pages={cycle.book.pages} />

      {totalMilestones > 0 && (
        <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Bosqichlar</h2>
            <span className="text-[11px] text-[color:var(--color-muted)]">{done}/{totalMilestones}</span>
          </div>
          <ProgressBar value={totalMilestones ? (done / totalMilestones) * 100 : 0} className="mt-2.5" />
          <ol className="mt-3 space-y-2.5">
            {cycle.milestones.map((m) => {
              const complete = m.dueAt < new Date();
              return (
                <li key={m.id} className="flex items-start gap-2.5">
                  {complete ? (
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#2f6d43]" />
                  ) : (
                    <Circle size={15} className="mt-0.5 shrink-0 text-[color:var(--color-muted-soft)]" />
                  )}
                  <div>
                    <p className={`text-[12.5px] ${complete ? "text-[color:var(--color-muted)]" : "font-medium"}`}>{m.title}</p>
                    <p className="text-[10.5px] text-[color:var(--color-muted)]">{formatDate(m.dueAt, "d MMM")}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Link href="/app/discussions" className="btn btn-secondary btn-sm">Muhokama</Link>
        <Link href={`/clubs/${membership.club.slug}`} className="btn btn-secondary btn-sm">Klub sahifasi</Link>
      </div>

      <History history={history} />
    </div>
  );
}

function History({ history }: { history: Array<{ id: string; book: { title: string; author: string } }> }) {
  if (history.length === 0) return null;
  return (
    <div>
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">O‘qilgan kitoblar</h2>
      <div className="overflow-hidden rounded-[12px] border border-[color:var(--color-line)] bg-white">
        {history.map((c) => (
          <div key={c.id} className="border-b border-[color:var(--color-line)] px-3.5 py-2.5 last:border-0">
            <p className="text-[12.5px] font-medium">{c.book.title}</p>
            <p className="text-[10.5px] text-[color:var(--color-muted)]">{c.book.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
