import type { Metadata } from "next";
import { NewsCard } from "@/components/site/cards";
import { SectionHeading } from "@/components/ui/primitives";
import { getLatestNews } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Yangiliklar",
  description: "TDIU klublari yangiliklari: Bookonomics, tanlovlar, tadbirlar va e’lonlar.",
};

export default async function NewsPage() {
  const news = await getLatestNews({ limit: 30 });
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionHeading eyebrow="Yangiliklar" title="Klub hayoti" description="E’lonlar, natijalar va muhim sanalar." />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((n) => (
          <NewsCard key={n.id} item={n} />
        ))}
      </div>
    </div>
  );
}
