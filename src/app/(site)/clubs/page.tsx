import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ClubCard } from "@/components/site/cards";
import { CATEGORY_LABELS, CATEGORY_ORDER, type ClubCategory } from "@/config/clubs";
import { getClubs } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Klublar",
  description: "TDIU talabalar klublari katalogi: intellektual, akademik, ijodiy, sport, ijtimoiy va sayohat klublari.",
};

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const clubs = await getClubs();
  const category = params.category as ClubCategory | undefined;
  const query = (params.q ?? "").trim().toLowerCase();

  const filtered = clubs.filter((c) => {
    const byCategory = category ? c.category === category : true;
    const byQuery = query
      ? `${c.name} ${c.summary} ${c.tagline}`.toLowerCase().includes(query)
      : true;
    return byCategory && byQuery;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <div className="eyebrow">Katalog</div>
        <h1 className="display mt-3 text-[38px] leading-tight sm:text-[46px]">Klublar</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-muted)]">
          {clubs.length} ta klub, 6 yo‘nalish. Har bir klubning o‘z sahifasi, tadbirlari va a’zolik tartibi bor.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-b border-[color:var(--color-line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          <FilterChip href="/clubs" active={!category} label={`Barchasi · ${clubs.length}`} />
          {CATEGORY_ORDER.map((cat) => {
            const count = clubs.filter((c) => c.category === cat).length;
            if (!count) return null;
            return (
              <FilterChip
                key={cat}
                href={`/clubs?category=${cat}`}
                active={category === cat}
                label={`${CATEGORY_LABELS[cat]} · ${count}`}
              />
            );
          })}
        </div>
        <form action="/clubs" className="relative w-full sm:w-64">
          {category && <input type="hidden" name="category" value={category} />}
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted-soft)]" />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Klub qidirish"
            className="input !pl-9"
            aria-label="Klub qidirish"
          />
        </form>
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
          ? "border-[#104070] bg-[color:var(--color-navy)] text-white"
          : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-line-strong)]",
      )}
    >
      {label}
    </Link>
  );
}
