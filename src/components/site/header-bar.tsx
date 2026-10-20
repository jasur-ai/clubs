"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useScrolled } from "@/components/site/motion";
import { cn } from "@/lib/utils";

const links = [
  { href: "/clubs", label: "Klublar" },
  { href: "/books", label: "Kutubxona" },
  { href: "/events", label: "Tadbirlar" },
  { href: "/news", label: "Yangiliklar" },
];

export function HeaderBar({ authed }: { authed: boolean }) {
  const scrolled = useScrolled(10);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header" data-scrolled={scrolled} data-open={open}>
      <div className="mx-auto flex h-[var(--header-h)] w-full max-w-[1180px] items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-9">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Asosiy navigatsiya">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" data-active={isActive(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://t.me/Tsue_clubs_bot"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 px-1.5 text-[12.5px] font-medium text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)] md:inline-flex"
          >
            Telegram
            <ArrowUpRight size={12} />
          </a>
          <span aria-hidden className="mx-1 hidden h-4 w-px bg-[color:var(--color-line)] md:block" />
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            <Link href={authed ? "/app" : "/login"} className="btn btn-ghost btn-sm">
              {authed ? "Kabinet" : "Kirish"}
            </Link>
            <Link href="/join" className="btn btn-primary btn-sm">
              A’zo bo‘lish
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={open}
            className="menu-btn lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <div className={cn("mobile-sheet lg:hidden", open && "is-open")} aria-hidden={!open}>
        <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col px-5 pb-8 pt-2">
          <nav className="flex flex-col" aria-label="Mobil navigatsiya">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                tabIndex={open ? 0 : -1}
                className="mobile-sheet-link group flex items-baseline justify-between border-b border-[color:var(--color-line)] py-4"
                style={{ transitionDelay: open ? `${90 + i * 55}ms` : "0ms" }}
              >
                <span className="display text-[30px] text-[color:var(--color-ink)]">{l.label}</span>
                <span className="section-index">{String(i + 1).padStart(2, "0")}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <div className="flex items-center gap-3">
              <Link href="/join" tabIndex={open ? 0 : -1} className="btn btn-primary btn-lg flex-1">
                A’zo bo‘lish
              </Link>
              <Link href={authed ? "/app" : "/login"} tabIndex={open ? 0 : -1} className="btn btn-secondary btn-lg flex-1">
                {authed ? "Kabinet" : "Kirish"}
              </Link>
            </div>
            <a
              href="https://t.me/Tsue_clubs_bot"
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              className="flex items-center justify-between rounded-[10px] border border-[color:var(--color-line)] px-4 py-3 text-[13px] text-[color:var(--color-ink-soft)]"
            >
              Telegram bot — @Tsue_clubs_bot
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
