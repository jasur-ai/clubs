import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { ClubLogo } from "@/components/ui/club-logo";
import { CATEGORY_LABELS, CATEGORY_ORDER, type ClubCategory } from "@/config/clubs";
import { applyDirectoryFilters, DAY_FILTERS, getDiscoveryClubs } from "@/lib/discovery";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Klublar",
  description: "TDIU talabalar klublari katalogi: intellektual, akademik, ijodiy, sport, ijtimoiy va sayohat klublari.",
};

const SORTS: Array<[string, string]> = [
  ["", "Tartib"],
  ["activity", "Faollik"],
  ["members", "A’zolar"],
  ["day", "Uchrashuv kuni"],
];

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; day?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const clubs = await getDiscoveryClubs();
  const category = params.category as ClubCategory | undefined;
  const filtered = applyDirectoryFilters(clubs, {
    category,
    day: params.day,
    q: params.q,
    sort: params.sort,
  });

  const query = (value: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    Object.entries({ ...params, ...value }).forEach(([key, val]) => {
      if (val) next.set(key, val);
    });
    const tail = next.toString();
    return tail ? `/clubs?${tail}` : "/clubs";
  };

  const compareHref = `/clubs/solishtirish?clubs=${clubs
    .slice()
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 2)
    .map((club) => club.slug)
    .join(",")}`;

  return (
    <div className="bg-[color:var(--color-paper)]">
      {/* ═══════════════════════════════════════════════════════════ masthead */}
      <div className="gz-wrap">
        <div className="grid gap-8 pb-9 pt-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:gap-14">
          <div className="min-w-0">
            <span className="gz-kicker">Katalog · {clubs.length} klub</span>
            <h1 className="gz-display mt-4 !text-[clamp(40px,6vw,86px)]">
              Klublar
            </h1>
            <p className="gz-lede mt-5">
              {clubs.length} ta klub, {CATEGORY_ORDER.length} yo‘nalish. Yo‘nalish, uchrashuv kuni yoki
              faollik bo‘yicha filtrlang — yoki ikkitasini yonma-yon solishtiring.
            </p>
          </div>

          <div className="border-t border-[color:var(--color-ink)] pt-4 lg:border-t-0 lg:border-l lg:border-[color:var(--color-line)] lg:pl-8 lg:pt-0">
            <Link href="/topish" className="gz-link block text-[13.5px] font-semibold">
              <span className="inline-flex items-center gap-2">
                <Sparkles size={14} strokeWidth={1.7} /> Menga mos klubni topish
              </span>
            </Link>
            <Link href={compareHref} className="mt-2.5 block text-[13.5px] font-semibold text-[color:var(--color-ink-soft)] transition-colors hover:text-[color:var(--color-ink)]">
              Ikki klubni solishtirish
            </Link>
            <Link href="/reyting" className="mt-2.5 block text-[13.5px] font-semibold text-[color:var(--color-ink-soft)] transition-colors hover:text-[color:var(--color-ink)]">
              Faollik reytingi
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ filters */}
      <div className="border-y border-[color:var(--color-line)] bg-[color:var(--color-surface-2)]">
        <div className="gz-wrap py-3.5">
          <div className="hide-scrollbar flex items-baseline gap-x-5 gap-y-2 overflow-x-auto">
            <FilterLink href={query({ category: undefined })} active={!category} label="Barchasi" count={clubs.length} />
            {CATEGORY_ORDER.map((cat) => {
              const count = clubs.filter((club) => club.category === cat).length;
              if (!count) return null;
              return (
                <FilterLink
                  key={cat}
                  href={query({ category: cat })}
                  active={category === cat}
                  label={CATEGORY_LABELS[cat]}
                  count={count}
                />
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[color:var(--color-line)] pt-3">
            <span className="gz-kicker shrink-0">Uchrashuv</span>
            <div className="hide-scrollbar flex items-baseline gap-x-3.5 overflow-x-auto">
              <SmallFilter href={query({ day: undefined })} active={!params.day} label="Har qanday" />
              {DAY_FILTERS.map((day) => (
                <SmallFilter key={day} href={query({ day })} active={params.day === day} label={day.slice(0, 4)} title={day} />
              ))}
            </div>

            <span aria-hidden className="hidden h-3 w-px bg-[color:var(--color-line-strong)] sm:block" />

            <div className="hide-scrollbar flex items-baseline gap-x-3.5 overflow-x-auto">
              <span className="gz-kicker shrink-0">Tartib</span>
              {SORTS.map(([value, label]) => (
                <SmallFilter
                  key={label}
                  href={query({ sort: value || undefined })}
                  active={(params.sort ?? "") === value}
                  label={label}
                />
              ))}
            </div>

            <form action="/clubs" className="relative ml-auto w-full max-w-[230px]">
              {category && <input type="hidden" name="category" value={category} />}
              {params.day && <input type="hidden" name="day" value={params.day} />}
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[color:var(--color-muted-soft)]"
              />
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Klub qidirish"
                aria-label="Klub qidirish"
                className="w-full border border-[color:var(--color-line)] bg-transparent py-1.5 pl-8 pr-3 text-[12px] text-[color:var(--color-ink)] outline-none transition-colors placeholder:text-[color:var(--color-muted-soft)] focus:border-[color:var(--color-ink)]"
              />
            </form>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ index */}
      <div className="gz-wrap pb-16 pt-7">
        <div className="flex items-baseline justify-between">
          <p className="text-[11.5px] text-[color:var(--color-muted)]">
            {filtered.length} ta klub ko‘rsatilmoqda
          </p>
          {(category || params.day || params.q || params.sort) && (
            <Link href="/clubs" className="gz-link text-[11.5px] font-semibold">
              Filtrni tozalash
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 border-t border-[color:var(--color-ink)] py-14 text-center">
            <p className="font-serif text-[24px]">Hech narsa topilmadi</p>
            <p className="mt-2 text-[13px] text-[color:var(--color-muted)]">
              Boshqa so‘z yoki yo‘nalish bilan urinib ko‘ring.
            </p>
            <Link href="/clubs" className="gz-btn mt-6">
              Filtrni tozalash
            </Link>
          </div>
        ) : (
          <ul className="mt-2 border-b border-[color:var(--color-line)]">
            {filtered.map((club) => (
              <li key={club.id} className="border-t border-[color:var(--color-line)]">
                <Link
                  href={`/clubs/${club.slug}`}
                  className="group grid grid-cols-[42px_minmax(0,1fr)] items-start gap-x-4 gap-y-2 py-4 transition-colors md:grid-cols-[42px_minmax(0,1.6fr)_minmax(0,0.9fr)_110px_92px_24px] md:items-center md:gap-x-6"
                  style={{ "--club-accent": club.accent } as React.CSSProperties}
                >
                  <ClubLogo name={club.name} logoUrl={club.logoUrl} accent={club.accent} size={40} />

                  <div className="min-w-0">
                    <h2 className="font-serif text-[19px] leading-tight text-[color:var(--color-ink)] decoration-[color:var(--color-brass-line)] decoration-1 underline-offset-[5px] group-hover:underline">
                      {club.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
                      {club.summary}
                    </p>
                  </div>

                  <div className="col-start-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)] md:col-start-auto">
                    {CATEGORY_LABELS[club.category as ClubCategory] ?? club.category}
                  </div>

                  <div className="col-start-2 text-[11.5px] text-[color:var(--color-muted)] md:col-start-auto">
                    {club.meetingDay ?? "Kun belgilanmagan"}
                    {club.members > 0 && (
                      <span className="block text-[10.5px] text-[color:var(--color-muted-soft)]">
                        {club.members} a’zo
                      </span>
                    )}
                  </div>

                  <div className="col-start-2 w-full max-w-[150px] md:col-start-auto md:max-w-none">
                    <div className="flex items-baseline justify-between text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                      <span>Faollik</span>
                      <span className="font-variant-numeric tabular-nums">{club.activity}</span>
                    </div>
                    <div className="mt-1 h-[3px] bg-[color:var(--color-line)]">
                      <span
                        className="block h-full bg-[color:var(--color-ink)] transition-[width] duration-500"
                        style={{ width: `${Math.max(4, club.activity)}%` }}
                      />
                    </div>
                  </div>

                  <ArrowUpRight
                    size={15}
                    className="col-start-2 hidden text-[color:var(--color-muted-soft)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--color-ink)] md:col-start-auto md:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterLink({ href, label, active, count }: { href: string; label: string; active: boolean; count: number }) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={cn(
        "group relative shrink-0 whitespace-nowrap pb-1 text-[12.5px] font-semibold transition-colors",
        active ? "text-[color:var(--color-ink)]" : "text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]",
      )}
    >
      {label}
      <span className="ml-1.5 font-variant-numeric text-[10.5px] font-medium tabular-nums text-[color:var(--color-muted-soft)]">
        {count}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px origin-left bg-[color:var(--color-ink)] transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}

function SmallFilter({ href, label, active, title }: { href: string; label: string; active: boolean; title?: string }) {
  return (
    <Link
      href={href}
      title={title}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap text-[11.5px] transition-colors",
        active
          ? "font-semibold text-[color:var(--color-ink)] underline decoration-1 underline-offset-4"
          : "text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]",
      )}
    >
      {label}
    </Link>
  );
}
