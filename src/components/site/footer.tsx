import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { YiSignature } from "@/components/brand/marks";

export function SiteFooter() {
  return (
    <footer className="mt-3 border-t-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)]">
      <div className="relative mx-auto w-full max-w-[1240px] px-4 pb-8 pt-10 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-[290px] text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
              Toshkent davlat iqtisodiyot universiteti talabalar klublarining yagona platformasi —
              tadbirlar, kitobxonlik va muhokamalar bir joyda.
            </p>
            <div className="mt-6 border-t border-[color:var(--color-line)] pt-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted-soft)]">
                Hamkor
              </p>
              <YiSignature emblem={26} className="mt-2 text-[color:var(--color-ink-soft)]" />
            </div>
          </div>

          <FooterCol
            title="Platforma"
            links={[
              ["Klublar", "/clubs"],
              ["A’zo bo‘lish", "/join"],
              ["Tadbirlar", "/events"],
              ["Yangiliklar", "/news"],
              ["A’zolar", "/azolar"],
              ["Bu hafta", "/haftalik"],
              ["Reyting", "/reyting"],
              ["Saqlanganlar", "/saqlangan"],
              ["Yordam", "/yordam"],
            ]}
          />
          <FooterCol
            title="Book Club"
            links={[
              ["Klub sahifasi", "/clubs/book-club"],
              ["Menga mos klub", "/topish"],
              ["Solishtirish", "/clubs/solishtirish"],
              ["Kutubxona", "/books"],
              ["Bookonomics", "/clubs/book-club#loyihalar"],
              ["Muhokamalar", "/app/discussions"],
            ]}
          />

          <div>
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">Aloqa</p>
            <ul className="mt-3.5 space-y-2 text-[12.5px] text-[color:var(--color-ink-soft)]">
              <li className="leading-relaxed">
                Toshkent, Islam Karimov ko‘chasi, 49
              </li>
              <li>
                <a className="transition-colors hover:text-[color:var(--color-ink)]" href="https://t.me/tsuebookclub" target="_blank" rel="noreferrer">
                  @tsuebookclub
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[color:var(--color-ink)]" href="https://t.me/Tsue_clubs_bot" target="_blank" rel="noreferrer">
                  @Tsue_clubs_bot
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[color:var(--color-ink)]" href="mailto:info@tsue.uz">
                  info@tsue.uz
                </a>
              </li>
            </ul>
            <a
              href="https://t.me/Tsue_clubs_bot"
              target="_blank"
              rel="noreferrer"
              className="gz-link mt-4 text-[12px] font-semibold"
            >
              Botni ochish <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[color:var(--color-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-snug text-[color:var(--color-muted)]">
            Toshkent davlat iqtisodiyot universiteti
            <br />
            Yoshlar ittifoqi bilan hamkorlikda · 2026
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-[color:var(--color-muted)]">
            <Link href="/about" className="transition-colors hover:text-[color:var(--color-ink)]">
              Platforma haqida
            </Link>
            <Link href="/admin" className="transition-colors hover:text-[color:var(--color-ink)]">
              Boshqaruv
            </Link>
            <a href="/api/health" className="transition-colors hover:text-[color:var(--color-ink)]">
              Tizim holati
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">{title}</p>
      <ul className="mt-3.5 space-y-2 text-[12.5px]">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-[color:var(--color-ink-soft)] transition-colors hover:text-[color:var(--color-ink)]">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
