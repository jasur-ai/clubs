"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Inbox,
  Library,
  Newspaper,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Boshqaruv paneli", icon: BarChart3, exact: true },
  { href: "/admin/join-requests", label: "A’zolik so‘rovlari", icon: Inbox, badgeKey: "requests" },
  { href: "/admin/members", label: "A’zolar", icon: Users },
  { href: "/admin/books", label: "Kutubxona", icon: Library },
  { href: "/admin/reading", label: "O‘qish davrlari", icon: BookOpen },
  { href: "/admin/events", label: "Tadbirlar", icon: CalendarDays },
  { href: "/admin/news", label: "Yangiliklar", icon: Newspaper },
  { href: "/admin/clubs", label: "Klublar", icon: ShieldCheck, superOnly: true },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings, superOnly: true },
];

export function AdminSidebar({ pending, isSuper }: { pending: number; isSuper: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-col gap-0.5 px-2.5 py-4">
      {items
        .filter((i) => !i.superOnly || isSuper)
        .map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[12.5px] font-medium transition-colors",
                active ? "bg-[#eef1f7] text-[#0b1426] shadow-[0_1px_2px_rgba(11,31,51,0.06)]" : "text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon size={15} className={active ? "text-[color:var(--color-link)]" : ""} />
              <span className="flex-1">{item.label}</span>
              {item.badgeKey === "requests" && pending > 0 && (
                <span className="rounded-full bg-[#a8492f] px-1.5 py-0.5 text-[10px] font-bold text-white">{pending}</span>
              )}
            </Link>
          );
        })}
    </nav>
  );
}
