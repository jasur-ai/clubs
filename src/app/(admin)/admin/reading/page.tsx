import Link from "next/link";
import { managedClubIds } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { addMilestoneAction, createCycleAction } from "@/app/actions/admin";
import { PageHeader, Panel, StatusPill, FieldLabel } from "@/components/admin/ui";
import { FormDialog } from "@/components/admin/form-dialog";
import { formatDate } from "@/lib/format";

export const metadata = { title: "O‘qish davrlari" };

export default async function ReadingAdminPage({ searchParams }: { searchParams: Promise<{ club?: string }> }) {
  const params = await searchParams;
  const user = await requireStaffPage();
  const scope = await managedClubIds(user);

  const clubs = await db.club.findMany({
    where: scope === "all" ? { isActive: true } : { id: { in: scope } },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
  const selected = params.club ? clubs.find((c) => c.slug === params.club) : clubs[0];

  const [books, cycles] = await Promise.all([
    db.book.findMany({ where: { clubId: selected?.id ?? "-" }, orderBy: { title: "asc" }, select: { id: true, title: true, author: true } }),
    db.readingCycle.findMany({
      where: { clubId: selected?.id ?? "-" },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        book: true,
        milestones: { orderBy: { sort: "asc" } },
        _count: { select: { progress: true, threads: true } },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="O‘qish davrlari"
        description="Yangi davr boshlanganda oldingi davr avtomatik yakunlanadi va barcha a’zolarga bildirishnoma yuboriladi."
        action={
          selected && books.length > 0 ? (
            <FormDialog label="Davr boshlash" title="Yangi o‘qish davri" description={selected.name}>
              <form action={createCycleAction} className="space-y-3">
                <input type="hidden" name="clubId" value={selected.id} />
                <div>
                  <FieldLabel>Kitob</FieldLabel>
                  <select name="bookId" className="select" required>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Boshlanish</FieldLabel>
                    <input type="datetime-local" name="startsAt" className="input" required />
                  </div>
                  <div>
                    <FieldLabel>Uchrashuv</FieldLabel>
                    <input type="datetime-local" name="meetingAt" className="input" />
                  </div>
                </div>
                <div>
                  <FieldLabel>Joy</FieldLabel>
                  <input name="location" className="input" placeholder="2-bino, 207-xona" />
                </div>
                <button className="btn btn-primary w-full">Boshlash</button>
              </form>
            </FormDialog>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {clubs.map((c) => (
          <Link
            key={c.id}
            href={`/admin/reading?club=${c.slug}`}
            className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold ${
              selected?.id === c.id ? "border-[#0b1f33] bg-[#0b1f33] text-white" : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)]"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {books.length === 0 && (
        <div className="rounded-[12px] border border-dashed border-[color:var(--color-line-strong)] bg-white px-6 py-10 text-center">
          <p className="text-[13px] font-semibold">Avval kitob qo‘shing</p>
          <Link href="/admin/books" className="btn btn-secondary btn-sm mt-3">Kutubxona</Link>
        </div>
      )}

      <div className="space-y-3">
        {cycles.map((c) => (
          <Panel key={c.id} title={c.book.title} meta={c.book.author}>
            <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--color-line)] bg-[#fafbfc] px-4 py-2">
              <StatusPill status={c.status} />
              <span className="text-[11px] text-[color:var(--color-muted)]">
                {c.startsAt ? formatDate(c.startsAt, "d MMM") : "—"} → {c.meetingAt ? formatDate(c.meetingAt, "d MMM, HH:mm") : "—"}
              </span>
              <span className="ml-auto text-[11px] text-[color:var(--color-muted)]">
                {c._count.progress} o‘quvchi · {c._count.threads} mavzu
              </span>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">Bosqichlar</p>
                <ol className="mt-2 space-y-1.5">
                  {c.milestones.map((m) => (
                    <li key={m.id} className="flex justify-between text-[11.5px]">
                      <span>{m.title}</span>
                      <span className="text-[color:var(--color-muted)]">{formatDate(m.dueAt, "d MMM")}</span>
                    </li>
                  ))}
                  {c.milestones.length === 0 && <li className="text-[11.5px] text-[color:var(--color-muted)]">Bosqich qo‘shilmagan.</li>}
                </ol>
              </div>
              <form action={addMilestoneAction} className="rounded-[10px] border border-[color:var(--color-line)] p-3">
                <input type="hidden" name="cycleId" value={c.id} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">Bosqich qo‘shish</p>
                <div className="mt-2 flex gap-2">
                  <input name="title" className="input h-8 flex-1 text-[12px]" placeholder="1–6 bob" required maxLength={120} />
                  <input type="date" name="dueAt" className="input h-8 w-36 text-[12px]" required />
                  <button className="btn btn-secondary btn-sm">Qo‘shish</button>
                </div>
              </form>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
