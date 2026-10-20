import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/primitives";
import { ClubLogo } from "@/components/ui/club-logo";
import { BottomNav } from "@/components/app/bottom-nav";
import { TelegramBootstrap } from "@/components/tg/telegram-bootstrap";
import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";

export const metadata: Metadata = {
  title: "Mini-ilova",
  robots: { index: false },
};

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login?next=/app");

  const [membership, unread] = await Promise.all([
    db.membership.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      include: { club: { select: { name: true, slug: true, accent: true, logoUrl: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  return (
    <div
      className="min-h-dvh bg-[color:var(--color-paper-deep)]"
      style={{ "--club-accent": membership?.club.accent ?? "#a8492f" } as React.CSSProperties}
    >
      <TelegramBootstrap />
      <div className="mx-auto min-h-dvh w-full max-w-[560px] bg-[color:var(--color-paper)] shadow-[0_0_60px_rgba(11,31,51,0.08)]">
        <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]/90 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/app" className="flex items-center gap-2">
              {membership?.club ? (
                <ClubLogo
                  name={membership.club.name}
                  logoUrl={membership.club.logoUrl}
                  accent={membership.club.accent}
                  size={30}
                  rounded="rounded-[7px]"
                />
              ) : (
                <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[color:var(--color-navy)] font-serif text-[11px] text-white">
                  T
                </span>
              )}
              <span className="text-[13px] font-semibold">{membership?.club.name ?? "TDIU Clubs"}</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/app/profile"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ink-soft)]"
                aria-label="Bildirishnomalar"
              >
                <Bell size={15} />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a8492f] px-1 text-[9px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <Link href="/app/profile" aria-label="Profil">
                <Avatar first={user.firstName} last={user.lastName} src={user.photoUrl} size={30} />
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 pb-24 pt-4">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
