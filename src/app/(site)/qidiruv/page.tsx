import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Newspaper, Search, Users } from "lucide-react";
import { normalise, searchAll, SEARCH_GROUPS, type SearchType } from "@/lib/search";

export const metadata: Metadata = {
  title: "Qidiruv",
  description: "TDIU klublari, kutubxona, tadbirlar va yangiliklar bo‘ylab yagona qidiruv.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

const ICON: Record<SearchType, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  club: Users,
  book: BookOpen,
  event: CalendarDays,
  news: Newspaper,
};

/** Marks the matched span so a student sees why a row surfaced. */
function Mark({ text, q }: { text: string; q: string }) {
  const needle = q.toLocaleLowerCase("uz-UZ");
  const at = needle ? text.toLocaleLowerCase("uz-UZ").indexOf(needle) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[3px] bg-[color:color-mix(in_oklab,var(--color-green)_24%,transparent)] px-[1px] text-[color:inherit]">
        {text.slice(at, at + needle.length)}
      </mark>
      {text.slice(at + needle.length)}
    </>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const raw = (params.q ?? "").trim();
  const q = normalise(raw);
  const ready = q.length >= 2;
  const hits = ready ? await searchAll(q, 24) : [];
  const total = hits.length;

  const grouped = SEARCH_GROUPS.map((group) => ({
    ...group,
    items: hits.filter((hit) => hit.type === group.type),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="section-index">Qidiruv</div>
      <h1 className="display mt-3 text-[34px] leading-[1.05] text-[color:var(--color-ink)] sm:text-[42px]">
        Sayt bo‘ylab qidiruv
      </h1>
      <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-[color:var(--color-muted)]">
        Klub, kitob, tadbir va yangiliklar — to‘rttasi bir maydonda. Istalgan sahifadan{" "}
        <kbd className="rounded-[4px] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-1 py-[1px] text-[10.5px] font-semibold">
          ⌘K
        </kbd>{" "}
        bilan ham ochish mumkin.
      </p>

      <form action="/qidiruv" className="mt-7 flex max-w-[560px] flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={1.9}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]"
          />
          <input
            name="q"
            defaultValue={raw}
            aria-label="Qidiruv so‘rovi"
            placeholder="Masalan: Book Club, Bulgakov, Zakovat"
            className="input h-[46px] w-full pl-10"
          />
        </div>
        <button type="submit" className="btn btn-primary h-[46px] px-6">
          Qidirish
        </button>
      </form>

      {!ready ? (
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SEARCH_GROUPS.map((group) => {
            const Icon = ICON[group.type];
            return (
              <Link
                key={group.type}
                href={group.type === "club" ? "/clubs" : group.type === "book" ? "/books" : group.type === "event" ? "/events" : "/news"}
                className="group flex items-center justify-between gap-3 rounded-[12px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3.5 transition-colors hover:border-[color:var(--color-line-strong)]"
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={15} strokeWidth={1.8} />
                  <span className="text-[13.5px] font-medium text-[color:var(--color-ink)]">{group.label}</span>
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-[color:var(--color-muted-soft)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            );
          })}
        </div>
      ) : total === 0 ? (
        <div className="mt-14 rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-muted)]">
            <Search size={19} strokeWidth={1.6} />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-[color:var(--color-ink)]">“{raw}” bo‘yicha natija yo‘q</p>
          <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-[color:var(--color-muted)]">
            So‘rovni qisqartirib ko‘ring yoki klub va tadbirlar ro‘yxatidan izlang.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/clubs" className="btn btn-secondary btn-sm">
              Klublar
            </Link>
            <Link href="/events" className="btn btn-ghost btn-sm">
              Tadbirlar
            </Link>
            <Link href="/books" className="btn btn-ghost btn-sm">
              Kutubxona
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[color:var(--color-line)] pb-3">
            <p className="text-[13px] text-[color:var(--color-muted)]">
              <span className="font-semibold text-[color:var(--color-ink)]">{raw}</span> bo‘yicha{" "}
              <span className="font-semibold text-[color:var(--color-ink)]">{total}</span> natija
            </p>
            <Link href="/qidiruv" className="link-quiet text-[12px]">
              Tozalash
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-9">
            {grouped.map((group) => {
              const Icon = ICON[group.type];
              return (
                <section key={group.type} className="reveal">
                  <div className="flex items-center gap-2 border-b border-[color:var(--color-line)] pb-2.5">
                    <Icon size={14} strokeWidth={1.9} className="text-[color:var(--color-muted)]" />
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                      {group.label}
                    </h2>
                    <span className="ml-auto text-[11px] tabular-nums text-[color:var(--color-muted-soft)]">
                      {group.items.length}
                    </span>
                  </div>
                  <div className="grid gap-x-10 sm:grid-cols-2">
                    {group.items.map((hit) => (
                      <Link
                        key={`${hit.type}-${hit.id}`}
                        href={hit.href}
                        className="group flex items-start gap-3 border-b border-[color:var(--color-line)] py-3.5 transition-colors hover:bg-[color:var(--color-surface-2)]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-medium leading-snug text-[color:var(--color-ink)] transition-colors group-hover:text-[color:var(--color-link)]">
                            <Mark text={hit.title} q={raw} />
                          </span>
                          {hit.meta ? (
                            <span className="mt-1 block line-clamp-1 text-[12px] text-[color:var(--color-muted)]">
                              <Mark text={hit.meta} q={raw} />
                            </span>
                          ) : null}
                        </span>
                        <ArrowRight
                          size={14}
                          className="mt-1 shrink-0 text-[color:var(--color-muted-soft)] transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
