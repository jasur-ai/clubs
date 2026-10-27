import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, MessageSquare } from "lucide-react";
import { BookCover } from "@/components/ui/book-cover";
import { SaveButton } from "@/components/site/save-button";
import { cycleTiming } from "@/lib/reading";
import { formatDate } from "@/lib/format";
import { db } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const book = await db.book.findUnique({ where: { id } });
  return book ? { title: `${book.title} — ${book.author}`, description: book.description } : { title: "Kitob topilmadi" };
}

/**
 * One book, laid out like a page in a catalogue raisonné: the object on the
 * left, the record on the right, the colophon set as rules rather than as a box.
 */
export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await db.book.findUnique({
    where: { id },
    include: {
      club: { select: { name: true, slug: true, accent: true } },
      cycles: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!book) notFound();

  const cycle = book.cycles[0];
  const timing = cycle ? cycleTiming(cycle) : null;
  const threads = await db.discussionThread.findMany({
    where: { cycleId: cycle?.id ?? "-" },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, title: true, createdAt: true, _count: { select: { posts: true } } },
  });

  const statusLabel = timing?.closed
    ? "Taqdimot o‘tkazildi"
    : cycle?.status === "READING"
      ? "Klubda o‘qilmoqda"
      : cycle?.status === "FINISHED"
        ? "O‘qilgan"
        : "Ro‘yxatda";

  return (
    <div style={{ "--club-accent": book.club.accent } as React.CSSProperties}>
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-8 sm:px-6">
        <div className="flex items-center justify-between gap-4 border-b border-[color:var(--color-line)] pb-4">
          <Link
            href="/books"
            className="group inline-flex items-center gap-2 text-[12.5px] font-medium text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
          >
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            Kutubxona
          </Link>
          <span className="cat-no">Asar · {book.genre ?? "badiiy"}</span>
        </div>

        <article className="mt-10 grid gap-10 sm:grid-cols-[minmax(0,320px)_minmax(0,1fr)] sm:gap-14 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {/* the object */}
          <div>
            <BookCover
              coverUrl={book.coverUrl}
              from={book.coverFrom}
              to={book.coverTo}
              title={book.title}
              author={book.author}
              priority
              sizes="(max-width: 640px) 90vw, 380px"
              className="w-full"
            />

            {/* colophon */}
            <dl className="mt-8 border-t border-[color:var(--color-line)] text-[13px]">
              <Colophon label="Muallif" value={book.author} />
              <Colophon label="Yil" value={book.year ? String(book.year) : "—"} />
              <Colophon label="Hajm" value={book.pages ? `${book.pages} bet` : "—"} />
              <Colophon label="Til" value={book.language === "uz" ? "O‘zbek" : book.language.toUpperCase()} />
              <Colophon label="Klub" value={book.club.name} href={`/clubs/${book.club.slug}`} />
            </dl>
          </div>

          {/* the record */}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-link)]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                {statusLabel}
              </span>
              {cycle?.program && (
                <>
                  <span aria-hidden className="text-[color:var(--color-line-strong)]">/</span>
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                    {cycle.program}
                  </span>
                </>
              )}
            </div>

            <h1 className="display mt-4 text-[44px] leading-[0.94] text-[color:var(--color-ink)] sm:text-[56px]">
              {book.title}
            </h1>
            <p className="mt-3 font-serif text-[19px] italic text-[color:var(--color-muted)]">
              {book.author}
              {book.year ? `, ${book.year}` : ""}
            </p>

            <p className="prose-editorial mt-7 max-w-[62ch]">{book.description}</p>

            {/* reading record */}
            {cycle && (
              <section className="mt-10">
                <h2 className="flex items-baseline gap-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                  O‘qish davri
                  <span aria-hidden className="h-px flex-1 bg-[color:var(--color-line)]" />
                </h2>

                <ol className="mt-4 space-y-0">
                  <TimelineRow
                    label="O‘qish boshlandi"
                    value={cycle.startsAt ? formatDate(cycle.startsAt, "d MMMM, yyyy") : "—"}
                  />
                  <TimelineRow
                    label={timing?.closed ? "Yakuniy uchrashuv bo‘lib o‘tdi" : "Yakuniy uchrashuv"}
                    value={cycle.meetingAt ? formatDate(cycle.meetingAt, "d MMMM, yyyy · HH:mm") : "—"}
                    hint={cycle.location ?? undefined}
                    icon={<MapPin size={13} />}
                  />
                  {cycle.focus && (
                    <li className="border-b border-[color:var(--color-line)] py-4">
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                        Muhokama yo‘nalishlari
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {cycle.focus.split("\n").filter(Boolean).map((line) => (
                          <li key={line} className="flex gap-2.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
                            <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-[color:var(--color-brass)]" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}
                </ol>

                {threads.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                      Muhokamalar
                    </p>
                    <div className="mt-2">
                      {threads.map((t) => (
                        <Link
                          key={t.id}
                          href={`/app/discussions/${t.id}`}
                          className="group flex items-center justify-between gap-4 border-b border-[color:var(--color-line)] py-3 text-[13.5px]"
                        >
                          <span className="line-clamp-1 text-[color:var(--color-ink-soft)] transition-colors group-hover:text-[color:var(--color-link)]">
                            {t.title}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-[11.5px] tabular-nums text-[color:var(--color-muted)]">
                            <MessageSquare size={12} /> {t._count.posts}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={`/clubs/${book.club.slug}`} className="btn btn-primary">
                Klub sahifasi
              </Link>
              <Link href="/app/read" className="btn btn-secondary">
                {timing?.closed ? "O‘z natijam" : "O‘qishni davom etish"}
              </Link>
              <SaveButton kind="book" id={book.id} title={book.title} meta={book.author ?? undefined} href={`/books/${book.id}`} />
            </div>

            {book.cycles.length > 1 && (
              <div className="mt-9 border-t border-[color:var(--color-line)] pt-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                  Bu asar klubda {book.cycles.length} marta o‘qilgan
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] text-[color:var(--color-muted)]">
                  <CalendarDays size={13} /> oxirgisi {cycle?.meetingAt ? formatDate(cycle.meetingAt, "d MMMM, yyyy") : "—"}
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function Colophon({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-line)] py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-[color:var(--color-ink)]">
        {href ? (
          <Link href={href} className="underline decoration-[color:var(--color-brass-line)] underline-offset-4 hover:text-[color:var(--color-link)]">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function TimelineRow({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <li className="border-b border-[color:var(--color-line)] py-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">{label}</p>
      <p className="mt-1 flex items-center gap-2 font-serif text-[17px] text-[color:var(--color-ink)]">
        {icon}
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[12.5px] text-[color:var(--color-muted)]">{hint}</p>}
    </li>
  );
}
