import type { Metadata } from "next";
import Link from "next/link";
import { NewsMedia } from "@/components/ui/news-media";
import { getLatestNews } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Yangiliklar",
  description: "TDIU klublari yangiliklari: Bookonomics, tanlovlar, tadbirlar va e’lonlar.",
};

export default async function NewsPage() {
  const news = await getLatestNews({ limit: 30 });
  const [lead, ...rest] = news;

  return (
    <div className="bg-[color:var(--color-paper)]">
      <div className="gz-wrap">
        <div className="pb-8 pt-10">
          <span className="gz-kicker">Yangiliklar · {news.length}</span>
          <h1 className="gz-display mt-4 !text-[clamp(40px,6vw,86px)]">Klub hayoti</h1>
          <p className="gz-lede mt-5">E’lonlar, natijalar va muhim sanalar.</p>
        </div>

        {/* the front page: one lead story, then briefs in two columns */}
        {lead && (
          <section className="grid gap-8 border-t border-[color:var(--color-ink)] pt-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
            <Link href={`/news/${lead.slug}`} className="group block min-w-0">
              <NewsMedia
                imageUrl={lead.imageUrl}
                title={lead.title}
                publishedAt={lead.publishedAt}
                section={lead.club?.name ?? "Yangiliklar"}
                accent={lead.club?.accent}
                size="wide"
                priority
                className="h-[260px] w-full border border-[color:var(--color-line)] sm:h-[330px]"
              />
              <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                {lead.club && (
                  <>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: lead.club.accent }} />
                    {lead.club.name}
                    <span className="text-[color:var(--color-line-strong)]">·</span>
                  </>
                )}
                {lead.publishedAt && <span>{formatDate(lead.publishedAt)}</span>}
              </div>
              <h2 className="mt-2 font-serif text-[clamp(26px,3.2vw,40px)] leading-[1.06] tracking-[-0.015em] text-[color:var(--color-ink)] decoration-[color:var(--color-brass-line)] decoration-1 underline-offset-[6px] group-hover:underline">
                {lead.title}
              </h2>
              <p className="mt-3 max-w-[54ch] text-[14px] leading-relaxed text-[color:var(--color-muted)]">
                {lead.excerpt}
              </p>
            </Link>

            <ul className="min-w-0 lg:border-l lg:border-[color:var(--color-line)] lg:pl-12">
              {rest.map((n) => (
                <li key={n.id} className="border-t border-[color:var(--color-line)] first:border-t-0 first:pt-0 last:border-b last:border-b-[color:var(--color-line)]">
                  <Link href={`/news/${n.slug}`} className="group block py-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                      {formatDate(n.publishedAt ?? new Date(), "d MMMM")}
                      {n.club ? ` · ${n.club.name}` : ""}
                    </span>
                    <h3 className="mt-1.5 font-serif text-[19px] leading-[1.14] text-[color:var(--color-ink)] decoration-[color:var(--color-brass-line)] decoration-1 underline-offset-4 group-hover:underline">
                      {n.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
                      {n.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="h-14" />
    </div>
  );
}
