import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, Search, Sparkles, Users } from "lucide-react";
import { ClubLogo } from "@/components/ui/club-logo";
import { Badge } from "@/components/ui/primitives";
import { CATEGORY_LABELS, CATEGORY_ORDER, type ClubCategory } from "@/config/clubs";
import { applyDirectoryFilters, DAY_FILTERS, getDiscoveryClubs } from "@/lib/discovery";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Klublar",
  description: "TDIU talabalar klublari katalogi: intellektual, akademik, ijodiy, sport, ijtimoiy va sayohat klublari.",
};

const SORTS: Array<[string, string]> = [
  ["", "Tartib bo‘yicha"],
  ["activity", "Faollik"],
  ["members", "A’zolar soni"],
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
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="eyebrow">Katalog</div>
          <h1 className="display mt-3 text-[38px] leading-tight sm:text-[46px]">Klublar</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-muted)]">
            {clubs.length} ta klub, 6 yo‘nalish. Yo‘nalish, uchrashuv kuni yoki faollik bo‘yicha filtrlang —
            yoki ikkitasini yonma-yon solishtiring.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/topish" className="btn btn-secondary btn-sm">
            <Sparkles size={14} /> Menga mos klubni topish
          </Link>
          <Link href={compareHref} className="btn btn-ghost btn-sm">
            Solishtirish
          </Link>
        </div>
      </div>

      {/* facets */}
      <div className="mt-8 space-y-3 border-b border-[color:var(--color-line)] pb-5">
        <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          <FilterChip href={query({ category: undefined })} active={!category} label={`Barchasi · ${clubs.length}`} />
          {CATEGORY_ORDER.map((cat) => {
            const count = clubs.filter((club) => club.category === cat).length;
            if (!count) return null;
            return (
              <FilterChip
                key={cat}
                href={query({ category: cat })}
                active={category === cat}
                label={`${CATEGORY_LABELS[cat]} · ${count}`}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted-soft)]">
            Uchrashuv
          </span>
          <div className="hide-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
            <DayChip href={query({ day: undefined })} active={!params.day} label="Har qanday kun" />
            {DAY_FILTERS.map((day) => (
              <DayChip key={day} href={query({ day })} active={params.day === day} label={day.slice(0, 4)} title={day} />
            ))}
          </div>

          <div className="hide-scrollbar flex items-center gap-1.5">
            {SORTS.map(([value, label]) => (
              <DayChip key={label} href={query({ sort: value || undefined })} active={(params.sort ?? "") === value} label={label} />
            ))}
          </div>
        </div>

        <form action="/clubs" className="relative w-full sm:w-72">
          {category && <input type="hidden" name="category" value={category} />}
          {params.day && <input type="hidden" name="day" value={params.day} />}
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted-soft)]"
          />
          <input name="q" defaultValue={params.q ?? ""} placeholder="Klub qidirish" className="input !pl-9" aria-label="Klub qidirish" />
        </form>
      </div>

      <p className="mt-4 text-[12.5px] text-[color:var(--color-muted)]">
        {filtered.length} ta klub ko‘rsatilmoqda
        {(category || params.day || params.q) && (
          <Link href="/clubs" className="ml-2 font-semibold text-[color:var(--color-link)]">
            Filtrni tozalash
          </Link>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-[14px] border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-surface)] p-12 text-center">
          <p className="text-sm font-semibold">Hech narsa topilmadi</p>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">Boshqa so‘z yoki yo‘nalish bilan urinib ko‘ring.</p>
          <Link href="/clubs" className="btn btn-secondary btn-sm mt-4">
            Filtrni tozalash
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-line-strong)] hover:shadow-[var(--shadow-card)]"
              style={{ "--club-accent": club.accent } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-3">
                <ClubLogo name={club.name} logoUrl={club.logoUrl} accent={club.accent} size={44} />
                <Badge tone="neutral">{CATEGORY_LABELS[club.category as ClubCategory] ?? club.category}</Badge>
              </div>

              <h3 className="mt-4 font-serif text-[19px] leading-snug text-[color:var(--color-ink)]">{club.name}</h3>
              <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">
                {club.summary}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-[color:var(--color-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={12} /> {club.members > 0 ? `${club.members} a’zo` : "Ochiq qabul"}
                </span>
                {club.meetingDay && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock size={12} /> {club.meetingDay}
                  </span>
                )}
                {club.rating != null && (
                  <span className="inline-flex items-center gap-1 font-semibold text-[color:var(--color-brass)]">
                    ★ {club.rating.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="mt-4 border-t border-[color:var(--color-line)] pt-3">
                <div className="flex items-center justify-between text-[11px] text-[color:var(--color-muted)]">
                  <span>Faollik</span>
                  <span className="tabular-nums text-[color:var(--color-ink-soft)]">{club.activity}</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[color:var(--color-surface-3)]">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${Math.max(4, club.activity)}%`, background: club.accent }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[12px]">
                <span className="text-[color:var(--color-muted)]">
                  {club.upcoming > 0 ? `${club.upcoming} yaqin tadbir` : "Tadbir rejalashtirilmoqda"}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[color:var(--color-ink)] transition-colors group-hover:text-[var(--club-accent)]">
                  Ochish <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
        active
          ? "border-transparent bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
          : "border-[color:var(--color-line)] bg-[color:var(--color-surface)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-line-strong)]",
      )}
      aria-pressed={active}
    >
      {label}
    </Link>
  );
}

function DayChip({
  href,
  label,
  active,
  title,
}: {
  href: string;
  label: string;
  active: boolean;
  title?: string;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-pressed={active}
      className={cn(
        "whitespace-nowrap rounded-[7px] px-2.5 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "bg-[color:color-mix(in_oklab,var(--color-green)_12%,transparent)] text-[color:var(--color-green)]"
          : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)]",
      )}
    >
      {label}
    </Link>
  );
}
