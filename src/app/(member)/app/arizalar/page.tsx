import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDashed, Clock3, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireUserPage } from "@/lib/session";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Arizalarim" };

const STAGES = ["NEW", "IN_REVIEW", "APPROVED"] as const;

const STAGE_LABEL: Record<string, string> = {
  NEW: "Yuborilgan",
  IN_REVIEW: "Ko‘rilmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

/**
 * Application tracker.
 *
 * Submitting a form and hearing nothing is the classic club-flow failure. The
 * student can now follow the request through the same three stages an admin sees,
 * including the rejection note when there is one.
 */
export default async function ApplicationsPage() {
  const user = await requireUserPage("/app/arizalar");

  const requests = await db.joinRequest.findMany({
    where: { OR: [{ userId: user.id }, { telegram: { contains: user.username ?? "" }, NOT: { telegram: "" } }] },
    orderBy: { createdAt: "desc" },
    include: { club: { select: { name: true, slug: true, accent: true } } },
  });

  const own = user.username ? requests : requests.filter((request) => request.userId === user.id);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11.5px] text-[color:var(--color-muted)]">A’zolik</p>
        <h1 className="mt-0.5 font-serif text-[24px] leading-tight">Arizalarim</h1>
      </div>

      {own.length === 0 ? (
        <div className="rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-5 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-muted)]">
            <CircleDashed size={17} strokeWidth={1.7} />
          </span>
          <p className="mt-3 text-[14px] font-semibold">Hali ariza topshirmagansiz</p>
          <p className="mx-auto mt-1 max-w-[280px] text-[12px] leading-relaxed text-[color:var(--color-muted)]">
            Klubni tanlang va bir daqiqada ariza yuboring — javob shu sahifada ko‘rinadi.
          </p>
          <Link href="/clubs" className="btn btn-primary btn-sm mt-4">
            Klublar
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {own.map((request) => {
            const rejected = request.status === "REJECTED";
            const stageIndex = STAGES.indexOf(request.status as (typeof STAGES)[number]);
            return (
              <li
                key={request.id}
                className="rounded-[13px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4"
                style={{ "--club-accent": request.club.accent } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: request.club.accent }} />
                      {request.club.name}
                    </p>
                    <Link href={`/clubs/${request.club.slug}`} className="mt-1 inline-flex items-center gap-1 font-serif text-[16px] leading-tight">
                      {request.club.name} <ArrowUpRight size={13} className="text-[color:var(--color-muted)]" />
                    </Link>
                    <p className="mt-1 text-[11.5px] text-[color:var(--color-muted)]">
                      {formatDate(request.createdAt, "d MMM, HH:mm")} · {request.faculty}, {request.course}-kurs
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                      request.status === "APPROVED"
                        ? "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]"
                        : rejected
                          ? "bg-[color:var(--color-danger-bg)] text-[color:var(--color-danger)]"
                          : "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]"
                    }`}
                  >
                    {STAGE_LABEL[request.status] ?? request.status}
                  </span>
                </div>

                {!rejected && (
                  <div className="mt-3.5 flex items-center gap-1.5">
                    {STAGES.map((stage, index) => {
                      const done = stageIndex >= index;
                      return (
                        <div key={stage} className="flex flex-1 items-center gap-1.5">
                          <span
                            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              done ? "bg-[color:var(--club-accent)] text-white" : "bg-[color:var(--color-surface-3)] text-[color:var(--color-muted)]"
                            }`}
                          >
                            {done ? <CheckCircle2 size={11} /> : index + 1}
                          </span>
                          <span className={`text-[10.5px] ${done ? "text-[color:var(--color-ink-soft)]" : "text-[color:var(--color-muted-soft)]"}`}>
                            {STAGE_LABEL[stage]}
                          </span>
                          {index < STAGES.length - 1 && (
                            <span
                              className={`h-px flex-1 ${stageIndex > index ? "bg-[color:var(--club-accent)]" : "bg-[color:var(--color-line)]"}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {rejected && (
                  <p className="mt-3 flex items-start gap-1.5 rounded-[8px] bg-[color:var(--color-danger-bg)] p-2.5 text-[11.5px] leading-relaxed text-[color:var(--color-danger)]">
                    <XCircle size={13} className="mt-0.5 shrink-0" />
                    {request.note || "Ariza rad etildi. Klub rahbari bilan bog‘lanib, sababini aniqlashingiz mumkin."}
                  </p>
                )}

                {request.status === "NEW" && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[color:var(--color-muted)]">
                    <Clock3 size={11} /> O‘rtacha javob muddati — 2 ish kuni
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
