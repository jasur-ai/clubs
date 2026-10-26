import type { Metadata } from "next";
import { SavedList } from "@/components/site/saved-list";

export const metadata: Metadata = {
  title: "Saqlanganlar",
  description: "Klub, kitob va tadbirlar uchun shaxsiy xatcho‘plar — hisobsiz, qurilmada saqlanadi.",
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="section-index">Xatcho‘plar</div>
      <h1 className="display mt-3 text-[34px] leading-[1.05] text-[color:var(--color-ink)] sm:text-[42px]">
        Saqlanganlar
      </h1>
      <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-[color:var(--color-muted)]">
        Keyinroq qaytmoqchi bo‘lgan sahifalar. Ro‘yxat shu qurilmada saqlanadi va hisob talab qilmaydi.
      </p>
      <SavedList />
    </div>
  );
}
