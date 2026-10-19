import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Platforma haqida",
  description: "TDIU Clubs — klublar, tadbirlar va kitobxonlik dasturi uchun yagona raqamli ekotizim.",
};

const modules = [
  ["Veb-sayt", "Klublar katalogi, klub sahifalari, yangiliklar va tadbirlar. SEO va tezkor yuklanish uchun server-side rendering."],
  ["Telegram bot", "Tezkor kirish nuqtasi: eslatmalar, tadbir e’lonlari va mini-ilovaga o‘tish."],
  ["Mini-ilova", "Telefonda o‘qish progressi, RSVP va muhokamalar — Telegram ichida."],
  ["Admin panel", "Rollar bo‘yicha boshqaruv: a’zolik so‘rovlari, kontent, statistika va audit jurnali."],
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
      <Badge tone="accent">TDIU · Yoshlar ittifoqi</Badge>
      <h1 className="display mt-4 text-[40px] leading-tight sm:text-[50px]">Bitta platforma,<br />butun klub ekotizimi.</h1>
      <p className="prose-editorial mt-5">
        TDIU Clubs — universitet klublarini raqamlashtirish loyihasi. Maqsad oddiy: talaba klubni topadi, a’zo bo‘ladi,
        tadbirlarga yoziladi va kitobxonlik dasturida qatnashadi — barchasi bitta hisob bilan, veb-sayt, Telegram bot va
        mini-ilova orqali.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {modules.map(([title, text]) => (
          <div key={title} className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-5">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">{text}</p>
          </div>
        ))}
      </div>

      <h2 className="display mt-14 text-[26px]">Qanday ishlaydi</h2>
      <ol className="mt-4 space-y-4">
        {[
          ["Ariza", "Talaba klub sahifasida ariza qoldiradi. Ariza klub rahbariga tushadi."],
          ["Tasdiqlash", "Rahbar arizani ko‘rib chiqadi va tasdiqlaydi. Talaba a’zolar safiga qo‘shiladi."],
          ["Ishtirok", "Tadbirlar, muhokamalar va o‘qish dasturi — mini-ilovada. Har bir faollik ball bilan qayd etiladi."],
          ["Hisobot", "Klub rahbari statistikani ko‘radi; platforma “Ijtimoiy faollik indeksi” uchun ma’lumot beradi."],
        ].map(([title, text], i) => (
          <li key={title} className="flex gap-4 rounded-[12px] border border-[color:var(--color-line)] bg-white p-4">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#104070] text-[12px] font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <p className="text-[14px] font-semibold">{title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--color-muted)]">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="display mt-14 text-[26px]">Ma’lumotlar va maxfiylik</h2>
      <p className="prose-editorial mt-3">
        Platforma faqat tadbirlar va a’zolik uchun zarur ma’lumotlarni saqlaydi. Telegram orqali kirishda imzo serverda
        tekshiriladi; parollar hech qachon ochiq matnda saqlanmaydi. Har bir boshqaruv amali audit jurnaliga yoziladi.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/join" className="btn btn-primary">A’zo bo‘lish</Link>
        <Link href="/clubs" className="btn btn-secondary">Klublar katalogi</Link>
      </div>
    </div>
  );
}
