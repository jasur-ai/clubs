"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Bookmark, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { SearchTrigger } from "@/components/site/command-palette";
import { useScrolled } from "@/components/site/motion";
import { useBookmarkCount } from "@/lib/bookmarks";
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
  const [progress, setProgress] = useState(0);
  const savedCount = useBookmarkCount();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
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
      <span
        aria-hidden
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div className="mx-auto flex h-[var(--header-h)] w-full max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center lg:flex" aria-label="Asosiy navigatsiya">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link"
                data-active={isActive(l.href)}
                aria-current={isActive(l.href) ? "page" : undefined}
              >
                {i > 0 && <span aria-hidden className="nav-sep" />}
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://t.me/Tsue_clubs_bot"
            target="_blank"
            rel="noreferrer"
            className="header-quiet hidden md:inline-flex"
          >
            Telegram
            <ArrowUpRight size={11} />
          </a>
          <SearchTrigger className="hidden sm:inline-flex" />
          <span className="hidden sm:inline-flex">
            <Link
              href="/saqlangan"
              aria-label={savedCount > 0 ? `Saqlanganlar — ${savedCount} ta` : "Saqlanganlar"}
              className="saved-header-btn"
            >
              <Bookmark size={15} strokeWidth={1.9} />
              {savedCount > 0 && <span className="saved-badge">{savedCount > 9 ? "9+" : savedCount}</span>}
            </Link>
          </span>
          <span aria-hidden className="hidden h-4 w-px bg-[color:var(--color-line-strong)] md:block" />
          <ThemeToggle />
          <div className="hidden items-center gap-4 sm:flex">
            <Link href={authed ? "/app" : "/login"} className="header-quiet">
              {authed ? "Kabinet" : "Kirish"}
            </Link>
            <Link href="/join" className="gz-btn !px-3.5 !py-2 !text-[12px]">
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
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event("clubs:search"));
            }}
            tabIndex={open ? 0 : -1}
            className="mb-3 flex items-center gap-2.5 border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3.5 py-3 text-left text-[13px] text-[color:var(--color-muted)]"
          >
            <Search size={15} />
            Qidirish — klub, kitob, tadbir
          </button>
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
              <Link href="/join" tabIndex={open ? 0 : -1} className="gz-btn flex-1 justify-center">
                A’zo bo‘lish
              </Link>
              <Link href={authed ? "/app" : "/login"} tabIndex={open ? 0 : -1} className="gz-btn gz-btn--ghost flex-1 justify-center">
                {authed ? "Kabinet" : "Kirish"}
              </Link>
            </div>
            <Link
              href="/saqlangan"
              tabIndex={open ? 0 : -1}
              className="flex items-center justify-between border border-[color:var(--color-line)] px-4 py-3 text-[13px] text-[color:var(--color-ink-soft)]"
            >
              <span className="inline-flex items-center gap-2">
                <Bookmark size={14} strokeWidth={1.9} /> Saqlanganlar
              </span>
              <span className="text-[11.5px] text-[color:var(--color-muted)]">
                {savedCount > 0 ? `${savedCount} ta` : "Bo‘sh"}
              </span>
            </Link>
            <a
              href="https://t.me/Tsue_clubs_bot"
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              className="flex items-center justify-between border border-[color:var(--color-line)] px-4 py-3 text-[13px] text-[color:var(--color-ink-soft)]"
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
