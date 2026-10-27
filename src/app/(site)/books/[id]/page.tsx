import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, MessageSquare } from "lucide-react";
import { CoverArt } from "@/components/ui/cover-art";
import { Badge } from "@/components/ui/primitives";
import { SaveButton } from "@/components/site/save-button";
import { cycleTiming } from "@/lib/reading";
import { formatDate } from "@/lib/format";
import { db } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const book = await db.book.findUnique({ where: { id } });
  return book ? { title: `${book.title} — ${book.author}`, description: book.description } : { title: "Kitob topilmadi" };
}

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

  return (
    <div style={{ "--club-accent": book.club.accent } as React.CSSProperties} className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <nav className="text-[12px] text-[color:var(--color-muted)]">
        <Link href="/books" className="hover:text-[color:var(--color-ink)]">Kutubxona</Link>
        <span className="mx-2">/</span>
        <span className="text-[color:var(--color-ink-soft)]">{book.title}</span>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-[260px_1fr]">
        <div>
          <CoverArt from={book.coverFrom} to={book.coverTo} title={book.title} author={book.author} variant="lines" className="aspect-[3/4] w-full" />
          <div className="mt-4 rounded-[12px] border border-[color:var(--color-line)] bg-white p-4 text-[13px]">
            <Row label="Muallif" value={book.author} />
            <Row label="Yil" value={book.year ? String(book.year) : "—"} />
            <Row label="Betlar" value={book.pages ? String(book.pages) : "—"} />
            <Row label="Janr" value={book.genre ?? "—"} />
            <Row label="Til" value={book.language === "uz" ? "O‘zbek" : book.language.toUpperCase()} />
          </div>
        </div>

        <div>
          <Badge tone="accent">{book.club.name}</Badge>
          <h1 className="display mt-3 text-[38px] leading-tight">{book.title}</h1>
          <p className="mt-2 text-[15px] text-[color:var(--color-muted)]">
            {book.author}
            {book.year ? ` · ${book.year}` : ""}
          </p>
          <p className="prose-editorial mt-5">{book.description}</p>

          {cycle && (
            <div className="mt-8 rounded-[14px] border border-[color:var(--color-line)] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
                  O‘qish davri{cycle.program ? ` · ${cycle.program}` : ""}
                </h2>
                <Badge tone={cycle.status === "READING" && !timing?.closed ? "success" : "neutral"}>
                  {timing?.closed
                    ? "Taqdimot o‘tkazildi"
                    : cycle.status === "READING"
                      ? "O‘qilmoqda"
                      : cycle.status === "FINISHED"
                        ? "Yakunlangan"
                        : "Rejalashtirilgan"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[10px] bg-[color:var(--color-surface-2)] p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">Boshlanish</p>
                  <p className="mt-1 text-[13.5px] font-medium">{cycle.startsAt ? formatDate(cycle.startsAt) : "—"}</p>
                </div>
                <div className="rounded-[10px] bg-[color:var(--color-surface-2)] p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">Uchrashuv</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[13.5px] font-medium">
                    <CalendarDays size={13} /> {cycle.meetingAt ? formatDate(cycle.meetingAt, "d MMM, HH:mm") : "—"}
                  </p>
                  {cycle.location && (
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-[12px] text-[color:var(--color-muted)]">
                      <MapPin size={12} /> {cycle.location}
                    </p>
                  )}
                </div>
              </div>
              {threads.length > 0 && (
                <div className="mt-4 space-y-2">
                  {threads.map((t) => (
                    <Link
                      key={t.id}
                      href={`/app/discussions/${t.id}`}
                      className="flex items-center justify-between rounded-[10px] border border-[color:var(--color-line)] px-3.5 py-2.5 text-[13px] hover:border-[color:var(--color-line-strong)]"
                    >
                      <span className="line-clamp-1">{t.title}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] text-[color:var(--color-muted)]">
                        <MessageSquare size={12} /> {t._count.posts}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/clubs/${book.club.slug}`} className="btn btn-primary">
              Klub sahifasi
            </Link>
            <Link href="/app/read" className="btn btn-secondary">
              {timing?.closed ? "O‘z natijam" : "O‘qishni davom etish"}
            </Link>
            <SaveButton
              kind="book"
              id={book.id}
              title={book.title}
              meta={book.author ?? undefined}
              href={`/books/${book.id}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[color:var(--color-line)] py-2 last:border-0 last:pb-0 first:pt-0">
      <span className="text-[color:var(--color-muted)]">{label}</span>
      <span className="font-medium text-[color:var(--color-ink)]">{value}</span>
    </div>
  );
}
