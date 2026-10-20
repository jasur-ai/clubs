import Link from "next/link";
import { CalendarDays, MapPin, Users, ArrowUpRight, BookOpen } from "lucide-react";
import { CoverArt } from "@/components/ui/cover-art";
import { Badge } from "@/components/ui/primitives";
import { ClubLogo } from "@/components/ui/club-logo";
import { CATEGORY_LABELS, type ClubCategory } from "@/config/clubs";
import { formatDate, timeRange } from "@/lib/format";
import { cn } from "@/lib/utils";

type ClubCardClub = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  category: string;
  accent: string;
  logoUrl?: string | null;
  coverStyle: string;
  meetingDay?: string | null;
  _count?: { memberships: number; events?: number };
};

export function ClubCard({ club, className }: { club: ClubCardClub; className?: string }) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[14px] border border-[color:var(--color-line)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-line-strong)] hover:shadow-[var(--shadow-card)]",
        className,
      )}
      style={{ "--club-accent": club.accent } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <ClubLogo name={club.name} logoUrl={club.logoUrl} accent={club.accent} size={44} />
        <Badge tone="neutral">{CATEGORY_LABELS[club.category as ClubCategory] ?? club.category}</Badge>
      </div>
      <h3 className="mt-4 font-serif text-[19px] leading-snug text-[color:var(--color-ink)]">{club.name}</h3>
      <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">{club.summary}</p>
      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-line)] pt-3 text-[12px] text-[color:var(--color-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <Users size={13} /> {(club._count?.memberships ?? 0) > 0 ? `${club._count?.memberships} a’zo` : "Ochiq qabul"}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-[color:var(--color-ink)] transition-colors group-hover:text-[var(--club-accent)]">
          Ochish <ArrowUpRight size={13} />
        </span>
      </div>
    </Link>
  );
}

type EventCardEvent = {
  id: string;
  title: string;
  description: string;
  type: string;
  startsAt: Date;
  endsAt: Date | null;
  location: string;
  capacity: number | null;
  coverFrom: string;
  coverTo: string;
  club: { name: string; slug: string; accent: string };
  _count?: { rsvps: number };
};

export function EventRow({ event, compact = false }: { event: EventCardEvent; compact?: boolean }) {
  const d = new Date(event.startsAt);
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex gap-4 rounded-[14px] border border-[color:var(--color-line)] bg-white p-4 transition-all hover:border-[color:var(--color-line-strong)] hover:shadow-[var(--shadow-card)]"
    >
      <div
        className="flex h-[64px] w-[58px] shrink-0 flex-col items-center justify-center rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)]"
        aria-hidden
      >
        <span className="font-serif text-[22px] leading-none text-[color:var(--color-ink)]">{d.getDate()}</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
          {fmtMonth(d)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: event.club.accent }} aria-hidden />
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
            {event.club.name}
          </span>
        </div>
        <h3 className="mt-1 line-clamp-1 text-[15px] font-semibold text-[color:var(--color-ink)] group-hover:underline">
          {event.title}
        </h3>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[color:var(--color-muted)]">{event.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[color:var(--color-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} /> {timeRange(event.startsAt, event.endsAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} /> {event.location}
          </span>
          {typeof event._count?.rsvps === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} /> {event._count.rsvps}
              {event.capacity ? ` / ${event.capacity}` : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function EventTile({ event }: { event: EventCardEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="group block">
      <CoverArt
        from={event.coverFrom}
        to={event.coverTo}
        title={formatDate(event.startsAt, "d MMMM")}
        variant="arc"
        compact
        className="aspect-[16/9] w-full"
      />
      <div className="mt-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
          {event.club.name}
        </span>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-[color:var(--color-ink)] group-hover:underline">
          {event.title}
        </h3>
        <p className="mt-1.5 text-[12.5px] text-[color:var(--color-muted)]">
          {timeRange(event.startsAt, event.endsAt)} · {event.location}
        </p>
      </div>
    </Link>
  );
}

type NewsCardItem = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date | null;
  coverFrom: string;
  coverTo: string;
  club: { name: string; slug: string; accent: string } | null;
};

export function NewsCard({ item, featured = false }: { item: NewsCardItem; featured?: boolean }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[14px] border border-[color:var(--color-line)] bg-white transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]",
        featured && "sm:flex-row",
      )}
    >
      <CoverArt
        from={item.coverFrom}
        to={item.coverTo}
        title={item.club?.name ?? "Klub hayoti"}
        label="Yangilik"
        compact
        className={cn("w-full", featured ? "sm:w-[46%] sm:min-h-[240px]" : "h-[132px]")}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
          {item.club && (
            <>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.club.accent }} aria-hidden />
              {item.club.name}
            </>
          )}
          {item.publishedAt && <span className="text-[color:var(--color-muted-soft)]">· {formatDate(item.publishedAt)}</span>}
        </div>
        <h3 className={cn("mt-2 font-serif leading-snug text-[color:var(--color-ink)]", featured ? "text-[24px]" : "text-[18px]")}>
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">{item.excerpt}</p>
        <span className="mt-auto pt-4 text-[12.5px] font-semibold text-[color:var(--color-ink)] group-hover:text-[color:var(--color-link)]">
          Batafsil
        </span>
      </div>
    </Link>
  );
}

type BookCardBook = {
  id: string;
  title: string;
  author: string;
  year?: number | null;
  genre?: string | null;
  coverFrom: string;
  coverTo: string;
  pages?: number | null;
};

export function BookCard({ book }: { book: BookCardBook }) {
  return (
    <Link href={`/books/${book.id}`} className="group block">
      <CoverArt
        from={book.coverFrom}
        to={book.coverTo}
        title={book.title}
        author={book.author}
        variant="lines"
        className="aspect-[3/4] w-full shadow-[var(--shadow-card)] transition-transform group-hover:-translate-y-1"
      />
      <div className="mt-3">
        <h3 className="line-clamp-1 text-[14.5px] font-semibold text-[color:var(--color-ink)]">{book.title}</h3>
        <p className="mt-0.5 text-[12.5px] text-[color:var(--color-muted)]">
          {book.author}
          {book.year ? `, ${book.year}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function BookRow({ book, meta }: { book: BookCardBook; meta?: string }) {
  return (
    <Link href={`/books/${book.id}`} className="group flex items-center gap-4 rounded-[12px] border border-[color:var(--color-line)] bg-white p-3">
      <CoverArt
        from={book.coverFrom}
        to={book.coverTo}
        title={book.title}
        variant="lines"
        compact
        className="h-[72px] w-[54px] shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[14px] font-semibold text-[color:var(--color-ink)] group-hover:underline">{book.title}</h4>
        <p className="mt-0.5 truncate text-[12.5px] text-[color:var(--color-muted)]">{book.author}</p>
        {meta && <p className="mt-1 text-[11.5px] text-[color:var(--color-muted-soft)]">{meta}</p>}
      </div>
      <BookOpen size={15} className="shrink-0 text-[color:var(--color-muted-soft)]" />
    </Link>
  );
}

function fmtMonth(d: Date) {
  // Node and the browser format uz-UZ differently; date-fns keeps the server
  // and client markup identical so hydration never mismatches.
  return formatDate(d, "MMM").replace(".", "");
}
