import Link from "next/link";
import { Logo } from "@/components/site/logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[color:var(--color-line)] bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[color:var(--color-muted)]">
            TDIU talabalar klublarining yagona platformasi: tadbirlar, kitobxonlik dasturi va muhokamalar.
          </p>
          <p className="mt-4 text-xs text-[color:var(--color-muted-soft)]">TDIU Yoshlar ittifoqi bilan hamkorlikda</p>
        </div>
        <FooterCol
          title="Platforma"
          links={[
            ["Klublar", "/clubs"],
            ["A’zo bo‘lish", "/join"],
            ["Tadbirlar", "/events"],
            ["Yangiliklar", "/news"],
          ]}
        />
        <FooterCol
          title="Book Club"
          links={[
            ["Klub sahifasi", "/clubs/book-club"],
            ["Kutubxona", "/books"],
            ["Bookonomics", "/clubs/book-club#loyihalar"],
            ["Muhokamalar", "/app/discussions"],
          ]}
        />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">Aloqa</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[color:var(--color-ink-soft)]">
            <li>Toshkent, Islam Karimov ko‘chasi, 49</li>
            <li>
              <a className="hover:text-[#104070]" href="https://t.me/tsuebookclub" target="_blank" rel="noreferrer">
                @tsuebookclub
              </a>
            </li>
            <li>
              <a className="hover:text-[#104070]" href="mailto:info@tsue.uz">
                info@tsue.uz
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--color-line)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-[color:var(--color-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 TDIU Clubs. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-5">
            <Link href="/about" className="hover:text-[#104070]">
              Platforma haqida
            </Link>
            <Link href="/admin" className="hover:text-[#104070]">
              Boshqaruv
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-[color:var(--color-ink-soft)] transition-colors hover:text-[#104070]">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
