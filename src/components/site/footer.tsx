import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { YiSignature } from "@/components/brand/marks";

export function SiteFooter() {
  return (
    <footer className="band-dark grain mt-16">
      <div aria-hidden className="contour-field opacity-40" />
      <div className="relative mx-auto w-full max-w-[1180px] px-4 pb-8 pt-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.1fr]">
          <div>
            <Logo invert />
            <p className="mt-5 max-w-[290px] text-[13.5px] leading-relaxed text-white/55">
              Toshkent davlat iqtisodiyot universiteti talabalar klublarining yagona platformasi — tadbirlar,
              kitobxonlik va muhokamalar bir joyda.
            </p>
            <div className="mt-7">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Hamkor
              </p>
              <YiSignature emblem={30} className="mt-2.5 text-white/55" />
            </div>
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Aloqa</p>
            <ul className="mt-4 space-y-2.5 text-[13.5px] text-white/65">
              <li className="leading-relaxed">
                Toshkent, Islam Karimov ko‘chasi, 49
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="https://t.me/tsuebookclub" target="_blank" rel="noreferrer">
                  @tsuebookclub
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="https://t.me/Tsue_clubs_bot" target="_blank" rel="noreferrer">
                  @Tsue_clubs_bot
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="mailto:info@tsue.uz">
                  info@tsue.uz
                </a>
              </li>
            </ul>
            <a
              href="https://t.me/Tsue_clubs_bot"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/75 transition-colors hover:text-white"
            >
              Botni ochish <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/tsue-emblem.png"
              alt="Toshkent davlat iqtisodiyot universiteti gerbi"
              width={30}
              height={30}
              loading="lazy"
              className="h-[30px] w-[30px] opacity-90"
            />
            <p className="text-[11.5px] leading-snug text-white/40">
              Toshkent davlat iqtisodiyot universiteti
              <br />
              Yoshlar ittifoqi bilan hamkorlikda · 2026
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] text-white/45">
            <Link href="/about" className="transition-colors hover:text-white">
              Platforma haqida
            </Link>
            <Link href="/admin" className="transition-colors hover:text-white">
              Boshqaruv
            </Link>
            <a href="/api/health" className="transition-colors hover:text-white">
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{title}</p>
      <ul className="mt-4 space-y-2.5 text-[13.5px]">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-white/65 transition-colors hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
