import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpDown, CalendarDays, Search, X } from "lucide-react";
import { ClubCard } from "@/components/site/cards";
import { CATEGORY_LABELS, CATEGORY_ORDER, type ClubCategory } from "@/config/clubs";
import { getClubs } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Klublar",
  description: "TDIU talabalar klublari katalogi: intellektual, akademik, ijodiy, sport, ijtimoiy va sayohat klublari.",
};

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"] as const;

const SORTS = [
  ["default", "Tavsiya etilgan"],
  ["az", "Alifbo bo‘yicha"],
  ["members", "A’zolar soni"],
] as const;

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; day?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const clubs = await getClubs();
  const category = params.category as ClubCategory | undefined;
  const query = (params.q ?? "").trim().toLowerCase();
  const day = DAYS.find((value) => value === params.day);
  const sort = SORTS.find(([value]) => value === params.sort)?.[0] ?? "default";

  const matched = clubs.filter((c) => {
    const byCategory = category ? c.category === category : true;
    const byQuery = query ? `${c.name} ${c.summary} ${c.tagline}`.toLowerCase().includes(query) : true;
    const byDay = day ? c.meetingDay === day : true;
    return byCategory && byQuery && byDay;
  });

  /**
   * "Tavsiya etilgan" is a real ranking, not a placeholder: clubs that meet more
   * often and already carry a membership come first, because a newcomer joining
   * an active club is likelier to still be there in a month.
   */
  const filtered = [...matched].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name, "uz");
    if (sort === "members") return b._count.memberships - a._count.memberships;
    return b._count.memberships * 2 + b._count.events - (a._count.memberships * 2 + a._count.events);
  });

  const hasFilters = Boolean(category || query || day || (params.sort && params.sort !== "default"));

  /** Keeps every filter in the URL — links stay shareable and back-button safe. */
  const withParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { category, q: params.q, day, sort, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "default") next.set(key, String(value));
    }
    const qs = next.toString();
    return qs ? `/clubs?${qs}` : "/clubs";
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <div className="eyebrow">Katalog</div>
        <h1 className="display mt-3 text-[38px] leading-tight sm:text-[46px]">Klublar</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-muted)]">
          {clubs.length} ta klub, 6 yo‘nalish. Har bir klubning o‘z sahifasi, tadbirlari va a’zolik tartibi bor.
        </p>
      </div>

      <div className="mt-8 border-b border-[color:var(--color-line)] pb-5">
        <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          <FilterChip href={withParams({ category: undefined })} active={!category} label={`Barchasi · ${clubs.length}`} />
          {CATEGORY_ORDER.map((cat) => {
            const count = clubs.filter((c) => c.category === cat).length;
            if (!count) return null;
            return (
              <FilterChip
                key={cat}
                href={withParams({ category: cat })}
                active={category === cat}
                label={`${CATEGORY_LABELS[cat]} · ${count}`}
              />
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form action="/clubs" className="flex flex-1 flex-wrap items-center gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            {params.sort && params.sort !== "default" && <input type="hidden" name="sort" value={params.sort} />}
            <div className="relative min-w-[190px] flex-1 sm:max-w-[260px]">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted-soft)]" />
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Klub qidirish"
                className="input !pl-9"
                aria-label="Klub qidirish"
              />
            </div>
            <label className="relative">
              <span className="sr-only">Uchrashuv kuni</span>
              <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted-soft)]" />
              <select name="day" defaultValue={day ?? ""} className="select !h-[38px] !w-auto !pl-8 pr-8 text-[12.5px]">
                <option value="">Har qanday kun</option>
                {DAYS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-secondary btn-sm h-[38px]">Qo‘llash</button>
          </form>

          <div className="flex items-center gap-2 text-[12px] text-[color:var(--color-muted)]">
            <ArrowUpDown size={13} className="text-[color:var(--color-muted-soft)]" />
            <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto">
              {SORTS.map(([value, label]) => (
                <Link
                  key={value}
                  href={withParams({ sort: value })}
                  className={cn(
                    "whitespace-nowrap rounded-[7px] px-2.5 py-1.5 transition-colors",
                    sort === value
                      ? "bg-[color:var(--color-surface-3)] font-semibold text-[color:var(--color-ink)]"
                      : "hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)]",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[color:var(--color-muted)]">
          <span>
            <span className="font-semibold text-[color:var(--color-ink)]">{filtered.length}</span> ta klub
            {day ? ` · ${day}` : ""}
            {query ? ` · “${params.q}”` : ""}
          </span>
          {hasFilters && (
            <Link href="/clubs" className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-line)] px-2 py-0.5 text-[11px] transition-colors hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-ink)]">
              <X size={11} /> Tozalash
            </Link>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-[14px] border border-dashed border-[color:var(--color-line-strong)] bg-white p-12 text-center">
          <p className="text-sm font-semibold">Hech narsa topilmadi</p>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">Boshqa so‘z yoki yo‘nalish bilan urinib ko‘ring.</p>
          <Link href="/clubs" className="btn btn-secondary btn-sm mt-4">
            Filtrni tozalash
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((club) => (
            <ClubCard key={club.id} club={club} />
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
          : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-line-strong)]",
      )}
    >
      {label}
    </Link>
  );
}
