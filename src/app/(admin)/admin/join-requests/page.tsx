import Link from "next/link";
import { Check, Clock, X } from "lucide-react";
import { managedClubIds } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { reviewJoinRequestAction, approveAllJoinRequestsAction } from "@/app/actions/admin";
import { PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const FILTERS = [
  ["NEW", "Yangi"],
  ["IN_REVIEW", "Ko‘rilmoqda"],
  ["APPROVED", "Tasdiqlangan"],
  ["REJECTED", "Rad etilgan"],
] as const;

export const metadata = { title: "A’zolik so‘rovlari" };

export default async function JoinRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string; club?: string }> }) {
  const params = await searchParams;
  const user = await requireStaffPage();
  const scope = await managedClubIds(user);
  const status = params.status ?? "NEW";

  const [clubs, requests, counts] = await Promise.all([
    db.club.findMany({
      where: scope === "all" ? { isActive: true } : { id: { in: scope } },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.joinRequest.findMany({
      where: {
        status,
        ...(scope === "all" ? {} : { clubId: { in: scope } }),
        ...(params.club ? { club: { slug: params.club } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { club: { select: { name: true, accent: true, slug: true } } },
    }),
    db.joinRequest.groupBy({
      by: ["status"],
      where: scope === "all" ? {} : { clubId: { in: scope } },
      _count: true,
    }),
  ]);

  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <PageHeader
        title="A’zolik so‘rovlari"
        description="Har bir arizani bir bosishda tasdiqlang. Tasdiqlanganda talaba avtomatik klub a’zosiga aylanadi va mini-ilova ochiladi."
        action={
          <div className="flex items-center gap-2">
            {status === "NEW" && requests.length > 0 && (
              <form action={approveAllJoinRequestsAction}>
                <button className="btn btn-secondary btn-sm">Barchasini tasdiqlash ({requests.length})</button>
              </form>
            )}
            <a
              href={`/api/admin/export?type=join${params.club ? `&club=${params.club}` : ""}`}
              className="btn btn-secondary btn-sm"
              title="Arizalarni CSV fayl sifatida yuklab olish"
            >
              CSV
            </a>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/join-requests?status=${value}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11.5px] font-semibold",
              status === value ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]" : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)]",
            )}
          >
            {label}
            <span className={cn("ml-1.5", status === value ? "text-white/60" : "text-[color:var(--color-muted)]")}>{countFor(value)}</span>
          </Link>
        ))}
        {clubs.length > 1 && (
          <div className="ml-auto flex shrink-0 gap-1.5">
            <Link href={`/admin/join-requests?status=${status}`} className={cn("rounded-full px-2.5 py-1.5 text-[11px] font-medium", !params.club ? "bg-[color:var(--color-surface-3)] text-[color:var(--color-link)]" : "text-[color:var(--color-muted)]")}>
              Barcha klublar
            </Link>
            {clubs.map((c) => (
              <Link
                key={c.id}
                href={`/admin/join-requests?status=${status}&club=${c.slug}`}
                className={cn("rounded-full px-2.5 py-1.5 text-[11px] font-medium", params.club === c.slug ? "bg-[color:var(--color-surface-3)] text-[color:var(--color-link)]" : "text-[color:var(--color-muted)]")}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {requests.map((r) => (
          <Panel key={r.id}>
            <div className="flex flex-wrap items-start gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: r.club.accent }} />
                  <h3 className="text-[13.5px] font-semibold">{r.fullName}</h3>
                  <StatusPill status={r.status} />
                  <span className="text-[10.5px] text-[color:var(--color-muted)]">{formatDate(r.createdAt, "d MMM, HH:mm")}</span>
                </div>
                <p className="mt-1 text-[11.5px] text-[color:var(--color-muted)]">
                  {r.club.name} · {r.faculty} · {r.course}-kurs{r.group ? ` · ${r.group}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-[color:var(--color-ink-soft)]">
                  <a href={`tel:${r.phone}`} className="hover:underline">{r.phone}</a>
                  <a href={`https://t.me/${r.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="hover:underline">
                    {r.telegram}
                  </a>
                </div>
                {r.motivation && (
                  <p className="mt-2 max-w-2xl rounded-[8px] bg-[color:var(--color-surface-2)] px-3 py-2 text-[11.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
                    {r.motivation}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                {r.status !== "APPROVED" && (
                  <form action={reviewJoinRequestAction}>
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="decision" value="APPROVED" />
                    <button className="btn btn-primary btn-sm gap-1">
                      <Check size={13} /> Tasdiqlash
                    </button>
                  </form>
                )}
                {r.status === "NEW" && (
                  <form action={reviewJoinRequestAction}>
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="decision" value="IN_REVIEW" />
                    <button className="btn btn-secondary btn-sm gap-1">
                      <Clock size={13} /> Ko‘rish
                    </button>
                  </form>
                )}
                {r.status !== "REJECTED" && (
                  <form action={reviewJoinRequestAction}>
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="decision" value="REJECTED" />
                    <button className="btn btn-ghost btn-sm gap-1 text-[color:var(--color-danger)]">
                      <X size={13} /> Rad
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Panel>
        ))}

        {requests.length === 0 && (
          <div className="rounded-[12px] border border-dashed border-[color:var(--color-line-strong)] bg-white px-6 py-12 text-center">
            <p className="text-[13px] font-semibold">Bu holatda ariza yo‘q</p>
            <p className="mt-1 text-[12px] text-[color:var(--color-muted)]">Yangi arizalar avtomatik shu ro‘yxatga tushadi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
