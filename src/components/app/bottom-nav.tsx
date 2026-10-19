"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Home, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Asosiy", icon: Home },
  { href: "/app/read", label: "O‘qish", icon: BookOpen },
  { href: "/app/discussions", label: "Muhokama", icon: MessagesSquare },
  { href: "/app/events", label: "Tadbirlar", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mini-ilova navigatsiyasi"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-line)] bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-[560px] grid-cols-4">
        {items.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold transition-colors",
                active ? "text-[color:var(--club-accent)]" : "text-[color:var(--color-muted)]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
