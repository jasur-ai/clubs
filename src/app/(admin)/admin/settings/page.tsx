import { redirect } from "next/navigation";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { broadcastAction } from "@/app/actions/admin";
import { PageHeader, Panel, FieldLabel } from "@/components/admin/ui";

export const metadata = { title: "Sozlamalar" };

export default async function SettingsPage() {
  const user = await requireStaffPage();
  if (user.role !== "SUPER_ADMIN") redirect("/admin");

  const [clubs, users, notifications, audit] = await Promise.all([
    db.club.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.user.count(),
    db.notification.count(),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { actor: { select: { firstName: true, lastName: true } } } }),
  ]);

  const env = [
    ["DATABASE_URL", Boolean(process.env.DATABASE_URL)],
    ["AUTH_SECRET", Boolean(process.env.AUTH_SECRET)],
    ["TELEGRAM_BOT_TOKEN", Boolean(process.env.TELEGRAM_BOT_TOKEN)],
    ["TELEGRAM_WEBHOOK_SECRET", Boolean(process.env.TELEGRAM_WEBHOOK_SECRET)],
    ["NEXT_PUBLIC_SITE_URL", Boolean(process.env.NEXT_PUBLIC_SITE_URL)],
  ] as const;

  return (
    <div>
      <PageHeader title="Sozlamalar" description="Platforma holati, bot integratsiyasi va xabarnomalar." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Muhit" meta={`${users} foydalanuvchi · ${notifications} bildirishnoma`}>
          <div className="divide-y divide-[color:var(--color-line)]">
            {env.map(([key, ok]) => (
              <div key={key} className="flex items-center justify-between px-4 py-2.5">
                <code className="text-[11.5px] text-[color:var(--color-ink-soft)]">{key}</code>
                <span className={`text-[10.5px] font-semibold ${ok ? "text-[#2f6d43]" : "text-[#8f3b3b]"}`}>{ok ? "o‘rnatilgan" : "yo‘q"}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[color:var(--color-line)] px-4 py-3 text-[11px] leading-relaxed text-[color:var(--color-muted)]">
            Bot webhook: <code>/api/telegram</code>. Telegram’da <code>setWebhook</code> orqali ulang (docs/DEPLOYMENT.md).
          </div>
        </Panel>

        <Panel title="Xabarnoma yuborish" meta="mini-ilova">
          <form action={broadcastAction} className="space-y-3 p-4">
            <div>
              <FieldLabel>Kimga</FieldLabel>
              <select name="clubId" className="select">
                <option value="all">Barcha talabalar</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} a’zolari</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Sarlavha</FieldLabel>
              <input name="title" className="input" required maxLength={120} placeholder="Uchrashuv vaqti o‘zgardi" />
            </div>
            <div>
              <FieldLabel>Matn</FieldLabel>
              <textarea name="body" rows={3} className="textarea" maxLength={400} />
            </div>
            <div>
              <FieldLabel>Havola</FieldLabel>
              <input name="url" className="input" defaultValue="/app" />
            </div>
            <button className="btn btn-primary w-full">Yuborish</button>
          </form>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Audit jurnali" meta="so‘nggi 20 amal">
          <div className="divide-y divide-[color:var(--color-line)]">
            {audit.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-2">
                <div>
                  <p className="text-[11.5px] font-medium">{a.action} · {a.entity}</p>
                  <p className="text-[10.5px] text-[color:var(--color-muted)]">
                    {a.actor ? `${a.actor.firstName} ${a.actor.lastName ?? ""}` : "Tizim"}{a.meta ? ` · ${a.meta}` : ""}
                  </p>
                </div>
                <span className="text-[10.5px] text-[color:var(--color-muted-soft)]">{a.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
