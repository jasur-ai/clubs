import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/site/logo";
import { MobileNav } from "@/components/site/mobile-nav";
import { ArrowUpRight } from "lucide-react";

const links = [
  { href: "/clubs", label: "Klublar" },
  { href: "/books", label: "Kutubxona" },
  { href: "/events", label: "Tadbirlar" },
  { href: "/news", label: "Yangiliklar" },
];

export async function SiteHeader() {
  const user = await getSession();
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-line)] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Asosiy navigatsiya">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13.5px] font-medium text-[color:var(--color-ink-soft)] transition-colors hover:text-[#104070]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="https://t.me/tsuebookclub"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 text-[13px] font-medium text-[color:var(--color-muted)] transition-colors hover:text-[#104070] sm:inline-flex"
          >
            Telegram <ArrowUpRight size={13} />
          </a>
          <Link href={user ? "/app" : "/login"} className="btn btn-secondary btn-sm hidden sm:inline-flex">
            {user ? "Kabinet" : "Kirish"}
          </Link>
          <Link href="/join" className="btn btn-primary btn-sm hidden sm:inline-flex">
            A’zo bo‘lish
          </Link>
          <MobileNav authed={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
