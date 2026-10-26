import { managedClubIds } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { updateMembershipAction, setUserRoleAction } from "@/app/actions/admin";
import { PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { InlineSelect } from "@/components/admin/inline-select";
import { Avatar } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";

export const metadata = { title: "A’zolar" };

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ club?: string; q?: string }> }) {
  const params = await searchParams;
  const user = await requireStaffPage();
  const scope = await managedClubIds(user);
  const query = (params.q ?? "").toLowerCase().trim();

  const memberships = await db.membership.findMany({
    where: {
      ...(scope === "all" ? {} : { clubId: { in: scope } }),
      ...(params.club ? { club: { slug: params.club } } : {}),
      ...(query
        ? {
            user: {
              OR: [
                { firstName: { contains: query } },
                { lastName: { contains: query } },
                { username: { contains: query } },
              ],
            },
          }
        : {}),
    },
    orderBy: [{ clubId: "asc" }, { joinedAt: "asc" }],
    include: {
      user: { select: { id: true, firstName: true, lastName: true, photoUrl: true, username: true, email: true, role: true, points: true } },
      club: { select: { name: true, slug: true, accent: true } },
    },
    take: 200,
  });

  const clubs = await db.club.findMany({
    where: scope === "all" ? { isActive: true } : { id: { in: scope } },
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  });

  return (
    <div>
      <PageHeader
        title="A’zolar"
        description="Rol va holatni bir bosishda o‘zgartiring. O‘zgarish darhol mini-ilovada aks etadi."
        action={
          <div className="flex items-center gap-2">
            <form action="/admin/members" className="flex gap-2">
              {params.club && <input type="hidden" name="club" value={params.club} />}
              <input name="q" defaultValue={params.q ?? ""} placeholder="Ism yoki username" className="input h-8 w-48 text-[12px]" />
              <button className="btn btn-secondary btn-sm">Qidirish</button>
            </form>
            <a
              href={`/api/admin/export?type=members${params.club ? `&club=${params.club}` : ""}`}
              className="btn btn-secondary btn-sm"
              title="Jadvalni CSV fayl sifatida yuklab olish"
            >
              CSV
            </a>
          </div>
        }
      />

      <div className="hide-scrollbar fade-x mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        <a href="/admin/members" className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${!params.club ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]" : "bg-white text-[color:var(--color-ink-soft)] border border-[color:var(--color-line)]"}`}>
          Barchasi
        </a>
        {clubs.map((c) => (
          <a
            key={c.slug}
            href={`/admin/members?club=${c.slug}`}
            className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${params.club === c.slug ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]" : "bg-white text-[color:var(--color-ink-soft)] border border-[color:var(--color-line)]"}`}
          >
            {c.name}
          </a>
        ))}
      </div>

      <Panel title="A’zoliklar" meta={`${memberships.length} ta`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
                <th className="px-4 py-2.5 font-semibold">Talaba</th>
                <th className="px-4 py-2.5 font-semibold">Klub</th>
                <th className="px-4 py-2.5 font-semibold">Rol</th>
                <th className="px-4 py-2.5 font-semibold">Holat</th>
                <th className="px-4 py-2.5 text-right font-semibold">Ball</th>
                <th className="px-4 py-2.5 text-right font-semibold">Qo‘shilgan</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m) => (
                <tr key={m.id} className="border-b border-[color:var(--color-line)] last:border-0 hover:bg-[color:var(--color-surface-2)]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar first={m.user.firstName} last={m.user.lastName} src={m.user.photoUrl} size={28} />
                      <div>
                        <p className="text-[12.5px] font-semibold leading-tight">{m.user.firstName} {m.user.lastName ?? ""}</p>
                        <p className="text-[10.5px] text-[color:var(--color-muted)]">{m.user.username ? `@${m.user.username}` : m.user.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.club.accent }} />
                      {m.club.name}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={updateMembershipAction} className="inline-flex">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <input type="hidden" name="status" value={m.status} />
                      <InlineSelect
                        name="role"
                        label="Rol"
                        defaultValue={m.role}
                        options={[
                          { value: "PRESIDENT", label: "Prezident" },
                          { value: "MANAGER", label: "Rahbar" },
                          { value: "MEMBER", label: "A’zo" },
                        ]}
                      />
                    </form>
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={updateMembershipAction} className="inline-flex">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <input type="hidden" name="role" value={m.role} />
                      <InlineSelect
                        name="status"
                        label="Holat"
                        defaultValue={m.status}
                        options={[
                          { value: "ACTIVE", label: "Faol" },
                          { value: "PENDING", label: "Kutilmoqda" },
                          { value: "BLOCKED", label: "Bloklangan" },
                        ]}
                      />
                    </form>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[11.5px] tabular-nums text-[color:var(--color-muted)]">{m.user.points}</td>
                  <td className="px-4 py-2.5 text-right text-[11px] text-[color:var(--color-muted)]">{formatDate(m.joinedAt, "d MMM yy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {memberships.length === 0 && <p className="px-4 py-8 text-center text-[12px] text-[color:var(--color-muted)]">A’zo topilmadi.</p>}
      </Panel>

      {user.role === "SUPER_ADMIN" && (
        <div className="mt-4">
          <PlatformRoles />
        </div>
      )}
    </div>
  );
}

async function PlatformRoles() {
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true, email: true, role: true, points: true, _count: { select: { memberships: true } } },
    take: 100,
  });

  return (
    <Panel title="Platforma rollari" meta="faqat super admin">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
              <th className="px-4 py-2.5 font-semibold">Foydalanuvchi</th>
              <th className="px-4 py-2.5 font-semibold">Klublar</th>
              <th className="px-4 py-2.5 font-semibold">Platforma roli</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[color:var(--color-line)] last:border-0">
                <td className="px-4 py-2.5">
                  <p className="text-[12.5px] font-medium">{u.firstName} {u.lastName ?? ""}</p>
                  <p className="text-[10.5px] text-[color:var(--color-muted)]">{u.email ?? "telegram"}</p>
                </td>
                <td className="px-4 py-2.5 text-[11.5px] text-[color:var(--color-muted)]">{u._count.memberships}</td>
                <td className="px-4 py-2.5">
                  <form action={setUserRoleAction} className="inline-flex">
                    <input type="hidden" name="userId" value={u.id} />
                    <InlineSelect
                      name="role"
                      label="Platforma roli"
                      defaultValue={u.role}
                      options={[
                        { value: "SUPER_ADMIN", label: "Super admin" },
                        { value: "CLUB_ADMIN", label: "Klub rahbari" },
                        { value: "EDITOR", label: "Muharrir" },
                        { value: "MEMBER", label: "Talaba" },
                      ]}
                    />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
