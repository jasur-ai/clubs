import type { Metadata } from "next";
import Link from "next/link";
import { BookCard } from "@/components/site/cards";
import { SectionHeading } from "@/components/ui/primitives";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kutubxona",
  description: "Book Club kutubxonasi: Ijtimoiy faollik indeksi ro‘yxati va Bookonomics asarlari.",
};

export default async function BooksPage({ searchParams }: { searchParams: Promise<{ genre?: string; q?: string }> }) {
  const params = await searchParams;
  const books = await db.book.findMany({ orderBy: { title: "asc" } });
  const genres = Array.from(new Set(books.map((b) => b.genre).filter(Boolean))) as string[];
  const query = (params.q ?? "").toLowerCase().trim();

  const filtered = books.filter((b) => {
    const byGenre = params.genre ? b.genre === params.genre : true;
    const byQuery = query ? `${b.title} ${b.author}`.toLowerCase().includes(query) : true;
    return byGenre && byQuery;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionHeading
        eyebrow="Kutubxona"
        title="Kitoblar"
        description="Bookonomics tanlovlari va Ijtimoiy faollik indeksi ro‘yxatidagi 12 ta asar."
        action={
          <form action="/books" className="flex gap-2">
            <input name="q" defaultValue={params.q ?? ""} placeholder="Kitob yoki muallif" className="input h-[38px] w-52" aria-label="Kitob qidirish" />
            <button className="btn btn-secondary btn-sm h-[38px]">Qidirish</button>
          </form>
        }
      />

      <div className="mt-8 flex flex-wrap gap-2">
        <GenreChip href="/books" label="Barchasi" active={!params.genre} />
        {genres.map((g) => (
          <GenreChip key={g} href={`/books?genre=${encodeURIComponent(g)}`} label={g} active={params.genre === g} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-[14px] border border-dashed border-[color:var(--color-line-strong)] bg-white p-12 text-center">
          <p className="text-sm font-semibold">Kitob topilmadi</p>
          <Link href="/books" className="btn btn-secondary btn-sm mt-4">Filtrni tozalash</Link>
        </div>
      )}
    </div>
  );
}

function GenreChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold",
        active ? "border-[#104070] bg-[#104070] text-white" : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)]",
      )}
    >
      {label}
    </Link>
  );
}
