import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { managedClubIds } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { deleteNewsAction } from "@/app/actions/admin";
import { PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { FormDialog } from "@/components/admin/form-dialog";
import { NewsForm } from "@/components/admin/news-form";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Yangiliklar" };

export default async function AdminNewsPage() {
  const user = await requireStaffPage();
  const scope = await managedClubIds(user);

  const [clubs, news] = await Promise.all([
    db.club.findMany({
      where: scope === "all" ? { isActive: true } : { id: { in: scope } },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    db.news.findMany({
      where: scope === "all" ? {} : { OR: [{ clubId: { in: scope } }, { clubId: null, authorId: user.id }] },
      orderBy: { createdAt: "desc" },
      include: { club: { select: { name: true, accent: true } }, author: { select: { firstName: true, lastName: true } } },
      take: 60,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Yangiliklar"
        description="Umumiy va klub yangiliklari. E’lon qilingan material darhol saytda paydo bo‘ladi."
        action={
          <FormDialog label="Yangilik yozish" title="Yangi material">
            <NewsForm clubs={clubs} lockedClubId={user.role === "CLUB_ADMIN" ? clubs[0]?.id : undefined} />
          </FormDialog>
        }
      />

      <div className="space-y-2">
        {news.map((n) => (
          <Panel key={n.id}>
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-semibold">{n.title}</p>
                  <StatusPill status={n.status} />
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[color:var(--color-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: n.club?.accent ?? "#17804a" }} />
                    {n.club?.name ?? "Umumiy"}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11.5px] text-[color:var(--color-muted)]">{n.excerpt}</p>
                <p className="mt-0.5 text-[10.5px] text-[color:var(--color-muted-soft)]">
                  {n.author ? `${n.author.firstName} ${n.author.lastName ?? ""} · ` : ""}
                  {formatDate(n.createdAt, "d MMM, HH:mm")}
                </p>
              </div>
              <div className="flex gap-2">
                {n.status === "PUBLISHED" && (
                  <Link href={`/news/${n.slug}`} target="_blank" className="btn btn-ghost btn-sm" aria-label="Saytda ko‘rish">
                    <ExternalLink size={13} />
                  </Link>
                )}
                <FormDialog label="Tahrirlash" title={n.title} variant="secondary">
                  <NewsForm clubs={clubs} item={n} lockedClubId={user.role === "CLUB_ADMIN" ? clubs[0]?.id : undefined} />
                </FormDialog>
                <form action={deleteNewsAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className="btn btn-ghost btn-sm text-[color:var(--color-danger)]" aria-label="O‘chirish">
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>
            </div>
          </Panel>
        ))}
        {news.length === 0 && (
          <div className="rounded-[12px] border border-dashed border-[color:var(--color-line-strong)] bg-white px-6 py-10 text-center text-[12.5px] text-[color:var(--color-muted)]">
            Yangilik yo‘q.
          </div>
        )}
      </div>
    </div>
  );
}
