import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { BookCard } from "@/components/site/cards";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kutubxona",
  description: "Book Club kutubxonasi: Ijtimoiy faollik indeksi ro‘yxati va Bookonomics asarlari.",
};

/**
 * The library is a shelf, not a product grid.
 *
 * What that means in practice: the covers are the page (real artwork, 2:3, on a
 * hairline shelf), the list carries a catalogue number and the year like an
 * index, and the filters are a printed row rather than a stack of pills. The
 * reading state is the only badge a book needs — whether the club is reading
 * it, has read it, or has it on the list.
 */
export default async function BooksPage({ searchParams }: { searchParams: Promise<{ genre?: string; q?: string }> }) {
  const params = await searchParams;
  const books = await db.book.findMany({
    orderBy: { title: "asc" },
    include: {
      cycles: { select: { status: true, meetingAt: true }, orderBy: { startsAt: "desc" }, take: 1 },
    },
  });
  const genres = Array.from(new Set(books.map((b) => b.genre).filter(Boolean))) as string[];
  const query = (params.q ?? "").toLowerCase().trim();

  const filtered = books.filter((b) => {
    const byGenre = params.genre ? b.genre === params.genre : true;
    const byQuery = query ? `${b.title} ${b.author}`.toLowerCase().includes(query) : true;
    return byGenre && byQuery;
  });

  const reading = books.filter((b) => b.cycles[0]?.status === "READING").length;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-10 sm:px-6 lg:pt-14">
      {/* masthead */}
      <header className="grid gap-8 border-b border-[color:var(--color-line)] pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            <span>Kutubxona</span>
            <span aria-hidden className="h-px w-6 bg-[color:var(--color-brass)]" />
            <span className="cat-no">Fond · {books.length}</span>
          </div>
          <h1 className="display mt-4 text-[52px] leading-[0.92] text-[color:var(--color-ink)] sm:text-[72px]">
            Kitoblar
          </h1>
          <p className="mt-4 max-w-[46ch] text-[14.5px] leading-relaxed text-[color:var(--color-muted)]">
            Ijtimoiy faollik indeksi ro‘yxatidagi o‘n ikkita asar va Bookonomics tanlovlari. Har bir
            asarning haqiqiy muqovasi bilan — qaysi biri hozir o‘qilayotganini sahifasida ko‘rish mumkin.
          </p>
        </div>

        <dl className="flex gap-8 lg:justify-end">
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">Asarlar</dt>
            <dd className="mt-1 font-serif text-[30px] leading-none tabular-nums">{books.length}</dd>
          </div>
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">O‘qilmoqda</dt>
            <dd className="mt-1 font-serif text-[30px] leading-none tabular-nums">{reading}</dd>
          </div>
        </dl>
      </header>

      {/* index bar */}
      <div className="flex flex-col gap-4 border-b border-[color:var(--color-line)] py-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Janr" className="hide-scrollbar fade-x -mx-1 flex items-center gap-1 overflow-x-auto px-1 text-[12.5px]">
          <GenreLink href="/books" label="Barchasi" active={!params.genre} count={books.length} />
          {genres.map((g) => (
            <GenreLink
              key={g}
              href={`/books?genre=${encodeURIComponent(g)}`}
              label={g}
              active={params.genre === g}
              count={books.filter((b) => b.genre === g).length}
            />
          ))}
        </nav>

        <form action="/books" className="flex items-center gap-2">
          {params.genre && <input type="hidden" name="genre" value={params.genre} />}
          <label className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted-soft)]" />
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Kitob yoki muallif"
              aria-label="Kitob qidirish"
              className="input h-[36px] w-[220px] !pl-9 text-[13px]"
            />
          </label>
          <button className="btn btn-secondary btn-sm h-[36px]">Qidirish</button>
        </form>
      </div>

      {/* shelf */}
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-7">
        {filtered.map((b, index) => {
          const cycle = b.cycles[0];
          const state =
            cycle?.status === "READING" ? "O‘qilmoqda" : cycle?.status === "FINISHED" ? "O‘qilgan" : null;
          return (
            <div key={b.id} className="relative">
              <span className="cat-no absolute -top-6 left-0 hidden lg:block">{String(index + 1).padStart(2, "0")}</span>
              <BookCard
                book={b}
                state={state}
              />
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 border-y border-[color:var(--color-line)] py-16 text-center">
          <p className="title text-[20px]">Bu shartda kitob topilmadi</p>
          <p className="mt-2 text-[13.5px] text-[color:var(--color-muted)]">Janrni yoki qidiruv so‘zini o‘zgartirib ko‘ring.</p>
          <Link href="/books" className="btn btn-secondary btn-sm mt-5">
            Filtrni tozalash
          </Link>
        </div>
      )}

      {/* footnote: where the list comes from */}
      <footer className="mt-14 flex flex-col gap-4 border-t border-[color:var(--color-line)] pt-6 text-[12.5px] text-[color:var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[62ch] leading-relaxed">
          Ro‘yxat Vazirlikning 186-son buyrug‘i bilan tasdiqlangan kitobxonlik mezoniga asoslanadi.
          Muqovalar nashriyot variantlari.
        </p>
        <Link href="/clubs/book-club" className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-[color:var(--color-link)]">
          Book Club sahifasi
          <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </footer>
    </div>
  );
}

function GenreLink({ href, label, active, count }: { href: string; label: string; active: boolean; count: number }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-baseline gap-1.5 border-b px-0 pb-1 pt-0.5 transition-colors",
        active
          ? "border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
          : "border-transparent text-[color:var(--color-muted)] hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-ink)]",
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="cat-no text-[10px]">{count}</span>
    </Link>
  );
}
