import Link from "next/link";
import { ExternalLink, FileText, Link2, Trash2 } from "lucide-react";
import { managedClubIds } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { deleteResourceAction, saveResourceAction } from "@/app/actions/admin";
import { FieldLabel, PageHeader, Panel } from "@/components/admin/ui";
import { FormDialog } from "@/components/admin/form-dialog";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Resurslar" };

const KIND_LABEL: Record<string, string> = {
  link: "Havola",
  file: "Fayl",
  guide: "Qo‘llanma",
};

export default async function AdminResourcesPage({ searchParams }: { searchParams: Promise<{ club?: string }> }) {
  const params = await searchParams;
  const user = await requireStaffPage();
  const scope = await managedClubIds(user);

  const clubs = await db.club.findMany({
    where: scope === "all" ? { isActive: true } : { id: { in: scope } },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
  const selected = params.club ? clubs.find((c) => c.slug === params.club) : clubs[0];

  const resources = selected
    ? await db.resource.findMany({ where: { clubId: selected.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div>
      <PageHeader
        title="Resurslar"
        description="Klubning doimiy fayllari: o‘quv to‘plamlari, jadval, nizom, shablonlar. Bir marta qo‘shiladi va klub sahifasida turadi."
        action={
          selected ? (
            <FormDialog
              label="Resurs qo‘shish"
              title="Yangi resurs"
              description={selected.name}
            >
              <form action={saveResourceAction} className="space-y-3">
                <input type="hidden" name="clubId" value={selected.id} />
                <div>
                  <FieldLabel>Sarlavha</FieldLabel>
                  <input name="title" className="input" required maxLength={140} placeholder="2026 bahor jadvali" />
                </div>
                <div>
                  <FieldLabel>Havola (https://)</FieldLabel>
                  <input name="url" type="url" className="input" required placeholder="https://drive.google.com/…" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Turi</FieldLabel>
                    <select name="kind" defaultValue="link" className="select">
                      <option value="link">Havola</option>
                      <option value="file">Fayl</option>
                      <option value="guide">Qo‘llanma</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Izoh (ixtiyoriy)</FieldLabel>
                    <input name="description" className="input" maxLength={280} placeholder="Har hafta yangilanadi" />
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-[color:var(--color-muted)]">
                  Faylni Google Drive yoki Telegram’ga yuklab, havolasini shu yerga qo‘ying — klub
                  sahifasida ochiladi.
                </p>
                <button className="btn btn-primary w-full">Saqlash</button>
              </form>
            </FormDialog>
          ) : null
        }
      />

      <div className="hide-scrollbar fade-x mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/admin/resurslar?club=${club.slug}`}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${
              selected?.id === club.id
                ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-line-strong)]"
            }`}
          >
            {club.name}
          </Link>
        ))}
      </div>

      <Panel title="Klub resurslari" meta={`${resources.length} ta`}>
        {resources.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <FileText size={20} className="mx-auto text-[color:var(--color-muted-soft)]" />
            <p className="mt-3 text-[13px] font-semibold text-[color:var(--color-ink)]">Hozircha resurs yo‘q</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-[color:var(--color-muted)]">
              Klub nizomi, uchrashuv jadvali yoki kitob to‘plamini qo‘shing — a’zolar ularni klub
              sahifasidan topadi, chatdan qidirmaydi.
            </p>
          </div>
        ) : (
          <ul>
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center gap-3 border-b border-[color:var(--color-line)] px-4 py-3 last:border-0"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[color:var(--color-surface-2)] text-[color:var(--color-green)]">
                  {resource.kind === "file" ? <FileText size={15} /> : <Link2 size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-[color:var(--color-ink)]">{resource.title}</p>
                  <p className="truncate text-[11px] text-[color:var(--color-muted)]">
                    {KIND_LABEL[resource.kind] ?? resource.kind}
                    {resource.description ? ` · ${resource.description}` : ""} · {formatDate(resource.createdAt, "d MMM, yyyy")}
                  </p>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm !px-2"
                  aria-label="Resursni ochish"
                >
                  <ExternalLink size={14} />
                </a>
                <form action={deleteResourceAction}>
                  <input type="hidden" name="id" value={resource.id} />
                  <button
                    className="btn btn-ghost btn-sm !px-2 text-[color:var(--color-danger)]"
                    aria-label="Resursni o‘chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
