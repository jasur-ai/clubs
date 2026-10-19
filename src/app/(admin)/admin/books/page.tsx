import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { managedClubIds } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { deleteBookAction } from "@/app/actions/admin";
import { PageHeader, Panel } from "@/components/admin/ui";
import { FormDialog } from "@/components/admin/form-dialog";
import { BookForm } from "@/components/admin/book-form";
import { CoverArt } from "@/components/ui/cover-art";

export const metadata = { title: "Kutubxona" };

export default async function AdminBooksPage({ searchParams }: { searchParams: Promise<{ club?: string }> }) {
  const params = await searchParams;
  const user = await requireStaffPage();
  const scope = await managedClubIds(user);

  const clubs = await db.club.findMany({
    where: scope === "all" ? { isActive: true } : { id: { in: scope } },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, accent: true },
  });

  const selected = params.club ? clubs.find((c) => c.slug === params.club) : clubs[0];
  const books = await db.book.findMany({
    where: { clubId: selected?.id ?? "-" },
    orderBy: { title: "asc" },
    include: { cycles: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Kutubxona"
        description="Klub kitoblari: Bookonomics tanlovlari va tavsiya ro‘yxati. Kitob qo‘shilgach o‘qish davri boshlash mumkin."
        action={selected ? <FormDialog label="Kitob qo‘shish" title="Yangi kitob" description={selected.name}><BookForm clubs={clubs} defaultClubId={selected.id} /></FormDialog> : null}
      />

      <div className="hide-scrollbar fade-x mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        {clubs.map((c) => (
          <Link
            key={c.id}
            href={`/admin/books?club=${c.slug}`}
            className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold ${
              selected?.id === c.id ? "border-[#0b1f33] bg-[#0b1f33] text-white" : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)]"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {books.map((b) => (
          <Panel key={b.id}>
            <div className="flex gap-3 p-3.5">
              <CoverArt from={b.coverFrom} to={b.coverTo} title={b.title} variant="lines" className="h-[86px] w-[64px] shrink-0 rounded-[5px]" compact />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{b.title}</p>
                <p className="text-[11.5px] text-[color:var(--color-muted)]">{b.author}{b.year ? `, ${b.year}` : ""}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[color:var(--color-muted)]">{b.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <FormDialog label="Tahrirlash" title={b.title} variant="secondary">
                    <BookForm clubs={clubs} book={b} />
                  </FormDialog>
                  <form action={deleteBookAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button className="btn btn-ghost btn-sm text-[#8f3b3b]" aria-label={`${b.title} ni o‘chirish`}>
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {books.length === 0 && (
        <div className="rounded-[12px] border border-dashed border-[color:var(--color-line-strong)] bg-white px-6 py-12 text-center">
          <p className="text-[13px] font-semibold">Bu klubda kitob yo‘q</p>
          <p className="mt-1 text-[12px] text-[color:var(--color-muted)]">Birinchi kitobni qo‘shing — o‘qish davri shundan boshlanadi.</p>
        </div>
      )}
    </div>
  );
}
