import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getSession, isAdminRole, managedClubIds } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Logo } from "@/components/site/logo";
import { Avatar } from "@/components/ui/primitives";

export const metadata: Metadata = { title: { default: "Boshqaruv", template: "%s · Boshqaruv" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminRole(user.role)) redirect("/app");

  const scope = await managedClubIds(user);
  const pending = await db.joinRequest.count({
    where: { status: "NEW", ...(scope === "all" ? {} : { clubId: { in: scope } }) },
  });

  return (
    <div className="min-h-dvh bg-[#eef1f4]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col bg-[#0b1f33] lg:flex">
        <div className="border-b border-white/10 px-4 py-4">
          <Logo invert compact />
          <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/40">Boshqaruv paneli</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AdminSidebar pending={pending} isSuper={user.role === "SUPER_ADMIN"} />
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-[8px] px-2 py-2">
            <Avatar first={user.firstName} last={user.lastName} src={user.photoUrl} size={28} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-semibold text-white">{user.firstName} {user.lastName ?? ""}</p>
              <p className="text-[10px] text-white/40">
                {user.role === "SUPER_ADMIN" ? "Platforma admini" : user.role === "EDITOR" ? "Muharrir" : "Klub rahbari"}
              </p>
            </div>
          </div>
          <Link href="/" className="mt-1 flex items-center gap-1.5 rounded-[8px] px-2 py-1.5 text-[11px] text-white/50 hover:text-white">
            <ExternalLink size={12} /> Saytga qaytish
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--color-line)] bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Logo compact />
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-[12px] font-medium text-[color:var(--color-muted)]">TDIU Clubs</span>
            <span className="text-[color:var(--color-muted-soft)]">/</span>
            <span className="text-[12px] text-[color:var(--color-muted)]">Yoshlar ittifoqi</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/app" className="btn btn-ghost btn-sm">Mini-ilova</Link>
            <Link href="/admin/join-requests" className="relative btn btn-secondary btn-sm">
              So‘rovlar
              {pending > 0 && <span className="ml-1 rounded-full bg-[#a8492f] px-1.5 text-[10px] font-bold text-white">{pending}</span>}
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
