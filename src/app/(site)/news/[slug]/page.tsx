import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsMedia } from "@/components/ui/news-media";
import { SaveButton } from "@/components/site/save-button";
import { ShareButton } from "@/components/site/share-button";
import { formatDate } from "@/lib/format";
import { db } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await db.news.findUnique({ where: { slug }, include: { club: { select: { name: true } } } });
  if (!item) return { title: "Yangilik topilmadi" };
  const card = `/api/og?title=${encodeURIComponent(item.title)}&eyebrow=${encodeURIComponent(item.club?.name ?? "Yangiliklar")}&meta=${encodeURIComponent(formatDate(item.publishedAt ?? item.createdAt, "d MMMM yyyy"))}`;
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: { title: item.title, description: item.excerpt, type: "article", images: [{ url: card, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: item.title, description: item.excerpt, images: [card] },
  };
}

export default async function NewsItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await db.news.findUnique({
    where: { slug },
    include: { club: { select: { name: true, slug: true, accent: true } }, author: { select: { firstName: true, lastName: true } } },
  });
  if (!item) notFound();

  const related = await db.news.findMany({
    where: { status: "PUBLISHED", slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true, publishedAt: true, imageUrl: true, coverFrom: true, coverTo: true },
  });

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <nav className="text-[12px] text-[color:var(--color-muted)]">
        <Link href="/news" className="hover:text-[color:var(--color-ink)]">Yangiliklar</Link>
        <span className="mx-2">/</span>
        <span className="text-[color:var(--color-ink-soft)]">{item.club?.name ?? "TDIU"}</span>
      </nav>

      <div className="mt-6 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
        {item.club && (
          <>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.club.accent }} aria-hidden />
            {item.club.name}
            <span className="text-[color:var(--color-muted-soft)]">·</span>
          </>
        )}
        {item.publishedAt && <span className="text-[color:var(--color-muted-soft)]">{formatDate(item.publishedAt)}</span>}
      </div>

      <h1 className="display mt-3 text-[34px] leading-tight sm:text-[42px]">{item.title}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[color:var(--color-muted)]">{item.excerpt}</p>

      <NewsMedia
        imageUrl={item.imageUrl}
        title={item.title}
        publishedAt={item.publishedAt}
        section={item.club?.name ?? "Yangiliklar"}
        accent={item.club?.accent}
        size="wide"
        priority
        className="mt-7 h-[248px] w-full rounded-[14px] border border-[color:var(--color-line)] sm:h-[300px]"
      />

      <div className="prose-editorial mt-8 whitespace-pre-line">{item.body}</div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <SaveButton
          kind="news"
          id={item.id}
          title={item.title}
          meta={item.club?.name ?? undefined}
          href={`/news/${item.slug}`}
          compact
        />
        <ShareButton title={item.title} text={item.excerpt ?? undefined} href={`/news/${item.slug}`} compact />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-[color:var(--color-line)] pt-5 text-[12px] text-[color:var(--color-muted)]">
        <span>{item.author ? `${item.author.firstName} ${item.author.lastName ?? ""}` : "TDIU Clubs"}</span>
        <Link href="/news" className="font-semibold text-[color:var(--color-ink)]">Barcha yangiliklar</Link>
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Yana o‘qish</h2>
          <div className="mt-3 grid gap-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/news/${r.slug}`} className="flex items-center justify-between rounded-[10px] border border-[color:var(--color-line)] bg-white px-4 py-3 text-[13.5px] hover:border-[color:var(--color-line-strong)]">
                <span className="line-clamp-1">{r.title}</span>
                <span className="ml-3 shrink-0 text-[11.5px] text-[color:var(--color-muted)]">
                  {r.publishedAt ? formatDate(r.publishedAt, "d MMM") : ""}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
