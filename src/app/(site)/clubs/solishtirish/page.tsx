import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, MapPin, Send, Users } from "lucide-react";
import { ClubLogo } from "@/components/ui/club-logo";
import { CATEGORY_LABELS, type ClubCategory } from "@/config/clubs";
import { getDiscoveryClubs } from "@/lib/discovery";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Klublarni solishtirish",
  description: "TDIU klublarini yonma-yon solishtiring: yo‘nalish, uchrashuv vaqti, a’zolar va faollik.",
  robots: { index: false, follow: true },
};

type Row = {
  label: string;
  render: (club: Awaited<ReturnType<typeof getDiscoveryClubs>>[number]) => React.ReactNode;
};

const ROWS: Row[] = [
  {
    label: "Yo‘nalish",
    render: (club) => CATEGORY_LABELS[club.category as ClubCategory] ?? club.category,
  },
  { label: "Tavsif", render: (club) => club.tagline },
  {
    label: "Uchrashuv",
    render: (club) =>
      club.meetingDay ? (
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock size={12} /> {club.meetingDay}
          {club.meetingTime ? `, ${club.meetingTime}` : ""}
        </span>
      ) : (
        "—"
      ),
  },
  {
    label: "Manzil",
    render: (club) =>
      club.location ? (
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={12} /> {club.location}
        </span>
      ) : (
        "—"
      ),
  },
  {
    label: "A’zolar",
    render: (club) => (
      <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
        <Users size={12} /> {club.members}
      </span>
    ),
  },
  { label: "Tadbirlar", render: (club) => <span className="tabular-nums">{club.events}</span> },
  { label: "Kutubxonadagi kitoblar", render: (club) => <span className="tabular-nums">{club.books}</span> },
  {
    label: "Faollik (0–100)",
    render: (club) => (
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[color:var(--color-surface-3)]">
          <span className="block h-full rounded-full" style={{ width: `${Math.max(4, club.activity)}%`, background: club.accent }} />
        </span>
        <span className="tabular-nums">{club.activity}</span>
      </span>
    ),
  },
  {
    label: "Tadbir bahosi",
    render: (club) =>
      club.rating != null ? (
        <span className="font-semibold text-[color:var(--color-brass)]">
          ★ {club.rating.toFixed(1)} <span className="font-normal text-[color:var(--color-muted)]">({club.feedbackCount})</span>
        </span>
      ) : (
        "Hali baholanmagan"
      ),
  },
];

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ clubs?: string }> }) {
  const params = await searchParams;
  const all = await getDiscoveryClubs();
  const wanted = (params.clubs ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 3);

  const selected = wanted.map((slug) => all.find((club) => club.slug === slug)).filter((club) => Boolean(club)) as typeof all;
  const options = selected.length >= 1 ? selected : all.slice().sort((a, b) => b.activity - a.activity).slice(0, 2);

  const withClub = (slug: string) => {
    const current = options.map((club) => club.slug).filter((value) => value !== "" && value !== slug);
    return `/clubs/solishtirish?clubs=${[...current, slug].slice(0, 3).join(",")}`;
  };
  const withoutClub = (slug: string) =>
    `/clubs/solishtirish?clubs=${options.map((club) => club.slug).filter((value) => value !== slug).join(",")}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <nav className="text-[12px] text-[color:var(--color-muted)]">
        <Link href="/clubs" className="hover:text-[color:var(--color-ink)]">
          Klublar
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[color:var(--color-ink-soft)]">Solishtirish</span>
      </nav>

      <div className="mt-6 max-w-2xl">
        <div className="eyebrow">Qaror qabul qilish</div>
        <h1 className="display mt-3 text-[34px] leading-tight sm:text-[42px]">Klublarni solishtirish</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--color-muted)]">
          Uch klavgacha yonma-yon qo‘ying: yo‘nalish, uchrashuv vaqti, a’zolar soni va haqiqiy tadbir bahosi.
          Bu ma’lumotni bitta Telegram postida topib bo‘lmaydi.
        </p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="w-40 border-b border-[color:var(--color-line)] pb-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                Mezon
              </th>
              {options.map((club) => (
                <th key={club.id} className="border-b border-[color:var(--color-line)] px-4 pb-3 text-left align-bottom">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2">
                      <ClubLogo name={club.name} logoUrl={club.logoUrl} accent={club.accent} size={38} />
                      <Link
                        href={`/clubs/${club.slug}`}
                        className="font-serif text-[17px] leading-tight text-[color:var(--color-ink)] hover:text-[var(--club-accent)]"
                      >
                        {club.name}
                      </Link>
                    </div>
                    {options.length > 1 && (
                      <Link
                        href={withoutClub(club.slug)}
                        aria-label={`${club.name} ni solishtirishdan olib tashlash`}
                        className="rounded-[6px] px-1.5 py-0.5 text-[11px] text-[color:var(--color-muted-soft)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-danger)]"
                      >
                        Olib tashlash
                      </Link>
                    )}
                  </div>
                </th>
              ))}
              {options.length < 3 && (
                <th className="border-b border-[color:var(--color-line)] px-4 pb-3 text-left align-bottom">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-dashed border-[color:var(--color-line-strong)] text-[color:var(--color-muted-soft)]">
                      +
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      Qo‘shish
                    </p>
                  </div>
                  <div className="mt-2 grid gap-1">
                    {all
                      .filter((club) => !options.some((option) => option.slug === club.slug))
                      .slice(0, 6)
                      .map((club) => (
                        <Link
                          key={club.id}
                          href={withClub(club.slug)}
                          className="rounded-[7px] px-2 py-1 text-[12.5px] text-[color:var(--color-ink-soft)] transition-colors hover:bg-[color:var(--color-surface-2)]"
                        >
                          + {club.name}
                        </Link>
                      ))}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, index) => (
              <tr key={row.label} className={cn(index % 2 === 1 && "bg-[color:color-mix(in_oklab,var(--color-surface-2)_60%,transparent)]")}>
                <th
                  scope="row"
                  className="border-b border-[color:var(--color-line)] py-3 pr-4 text-left align-top text-[12px] font-medium text-[color:var(--color-muted)]"
                >
                  {row.label}
                </th>
                {options.map((club) => (
                  <td
                    key={club.id}
                    className="border-b border-[color:var(--color-line)] px-4 py-3 align-top text-[13px] text-[color:var(--color-ink-soft)]"
                  >
                    {row.render(club)}
                  </td>
                ))}
                {options.length < 3 && <td className="border-b border-[color:var(--color-line)]" />}
              </tr>
            ))}
            <tr>
              <th scope="row" className="py-5 pr-4 text-left text-[12px] font-medium text-[color:var(--color-muted)]">
                Harakat
              </th>
              {options.map((club) => (
                <td key={club.id} className="px-4 py-5 align-top">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/join?club=${club.slug}`} className="btn btn-primary btn-sm">
                      A’zo bo‘lish
                    </Link>
                    {club.telegramUrl && (
                      <a
                        href={club.telegramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm"
                        aria-label={`${club.name} Telegram kanali`}
                      >
                        <Send size={13} />
                      </a>
                    )}
                  </div>
                </td>
              ))}
              {options.length < 3 && <td />}
            </tr>
          </tbody>
        </table>
      </div>

      <Link href="/clubs" className="link-quiet mt-8 inline-flex text-[13px]">
        Katalogga qaytish <ArrowUpRight size={13} />
      </Link>
    </div>
  );
}
