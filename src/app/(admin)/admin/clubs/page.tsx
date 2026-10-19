import { redirect } from "next/navigation";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { updateClubAction } from "@/app/actions/admin";
import { PageHeader, Panel, FieldLabel } from "@/components/admin/ui";
import { FormDialog } from "@/components/admin/form-dialog";

export const metadata = { title: "Klublar" };

export default async function AdminClubsPage() {
  const user = await requireStaffPage();
  if (user.role !== "SUPER_ADMIN") redirect("/admin");

  const clubs = await db.club.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { memberships: true, events: true, books: true, news: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Klublar"
        description="Har bir klub — alohida ekotizim: sahifa, bot, mini-ilova. Kontaktlar va vizual uslub shu yerda boshqariladi."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {clubs.map((c) => (
          <Panel key={c.id}>
            <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-line)] px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.accent }} />
                  <p className="text-[13px] font-semibold">{c.name}</p>
                  {!c.isActive && <span className="text-[10px] font-semibold text-[#8f3b3b]">nofaol</span>}
                </div>
                <p className="mt-0.5 text-[11px] text-[color:var(--color-muted)]">
                  {c._count.memberships} a’zo · {c._count.events} tadbir · {c._count.books} kitob · {c._count.news} yangilik
                </p>
              </div>
              <FormDialog label="Sozlash" title={c.name} variant="secondary">
                <form action={updateClubAction} className="space-y-3">
                  <input type="hidden" name="id" value={c.id} />
                  <div>
                    <FieldLabel>Qisqa shior</FieldLabel>
                    <input name="tagline" defaultValue={c.tagline} className="input" maxLength={160} />
                  </div>
                  <div>
                    <FieldLabel>Tavsif</FieldLabel>
                    <textarea name="summary" defaultValue={c.summary} rows={3} className="textarea" maxLength={400} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Telegram</FieldLabel>
                      <input name="telegramUrl" defaultValue={c.telegramUrl ?? ""} className="input" placeholder="https://t.me/..." />
                    </div>
                    <div>
                      <FieldLabel>Instagram</FieldLabel>
                      <input name="instagramUrl" defaultValue={c.instagramUrl ?? ""} className="input" placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                      <FieldLabel>Email</FieldLabel>
                      <input name="email" defaultValue={c.email ?? ""} className="input" type="email" />
                    </div>
                    <div>
                      <FieldLabel>Rang</FieldLabel>
                      <input name="accent" defaultValue={c.accent} className="input" placeholder="#a8492f" />
                    </div>
                    <div>
                      <FieldLabel>Uchrashuv kuni</FieldLabel>
                      <input name="meetingDay" defaultValue={c.meetingDay ?? ""} className="input" placeholder="Payshanba" />
                    </div>
                    <div>
                      <FieldLabel>Uchrashuv vaqti</FieldLabel>
                      <input name="meetingTime" defaultValue={c.meetingTime ?? ""} className="input" placeholder="16:00" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Joy</FieldLabel>
                    <input name="location" defaultValue={c.location ?? ""} className="input" />
                  </div>
                  <button className="btn btn-primary w-full">Saqlash</button>
                </form>
              </FormDialog>
            </div>
            <div className="px-4 py-2.5">
              <p className="line-clamp-2 text-[11.5px] leading-relaxed text-[color:var(--color-muted)]">{c.summary}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10.5px] text-[color:var(--color-muted)]">
                <span className="rounded-full bg-[#f1f4f8] px-2 py-0.5">/{c.slug}</span>
                {c.meetingDay && <span className="rounded-full bg-[#f1f4f8] px-2 py-0.5">{c.meetingDay}, {c.meetingTime}</span>}
                {c.telegramUrl && <span className="rounded-full bg-[#f1f4f8] px-2 py-0.5">Telegram ulangan</span>}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
