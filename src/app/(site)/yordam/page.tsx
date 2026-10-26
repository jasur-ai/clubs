import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bookmark, CalendarPlus, Command, Search, Send, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Yordam",
  description: "TDIU Clubs bo‘yicha qisqa qo‘llanma: a’zo bo‘lish, taqvim, qidiruv va xatcho‘plar.",
};

const FAQ: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "Klubga qanday a’zo bo‘laman?",
    a: (
      <>
        Klub sahifasidagi <b>“A’zo bo‘lish”</b> tugmasi ariza formasini ochadi. Ariza klub rahbariga
        tushadi va panelda ko‘riladi; tasdiqlanganda mini-ilova avtomatik ochiladi. Ariza holatini
        botdagi <code>/profil</code> buyrug‘i bilan ham tekshirish mumkin.
      </>
    ),
  },
  {
    q: "Telegram bot nima qiladi?",
    a: (
      <>
        Bot (<b>@Tsue_clubs_bot</b>) e’lonlarni kanaldan saytga olib keladi, arizalarni qabul qiladi
        va mini-ilovani ochadi. Sayt esa bot qila olmaydigan ishlarga qaratilgan: qidiruv, taqvim,
        xatcho‘plar va klub bo‘yicha solishtirish.
      </>
    ),
  },
  {
    q: "Tadbirlarni taqvimimga qanday qo‘shaman?",
    a: (
      <>
        Har bir tadbir sahifasida <b>“Taqvimga qo‘shish”</b> tugmasi bor — u <code>.ics</code> fayl
        yuklaydi va tadbirdan 2 soat oldin eslatma qo‘yadi. Agar hamma tadbirlar kerak bo‘lsa,
        tadbirlar sahifasidagi <b>“Taqvimga obuna”</b> havolasidan foydalaning: yangi tadbirlar
        telefoningiz taqvimiga o‘zi qo‘shilib boradi.
      </>
    ),
  },
  {
    q: "Xatcho‘plar hisob talab qiladimi?",
    a: (
      <>
        Yo‘q. <b>“Saqlash”</b> tugmasi klub, kitob, tadbir va yangilikni shu qurilmada saqlaydi —
        ro‘yxatdan o‘tish shart emas. Ro‘yxat <b>Saqlanganlar</b> sahifasida ko‘rinadi va u yerdan
        tadbirlarni bitta fayl qilib taqvimga chiqarish mumkin.
      </>
    ),
  },
  {
    q: "Qidiruv qanday ishlaydi?",
    a: (
      <>
        Klaviaturada <kbd>⌘K</kbd> yoki <kbd>Ctrl</kbd>+<kbd>K</kbd> bosilsa palitra ochiladi va klub,
        kitob, tadbir hamda yangiliklar bir maydonda qidiriladi. To‘liq natijalar ro‘yxati{" "}
        <Link href="/qidiruv" className="underline decoration-[color:var(--color-line-strong)] underline-offset-4 hover:text-[color:var(--color-link)]">
          /qidiruv
        </Link>{" "}
        sahifasida.
      </>
    ),
  },
  {
    q: "Klub rahbari sifatida ishtirokchilar ro‘yxatini olsam bo‘ladimi?",
    a: (
      <>
        Ha. Boshqaruv panelida a’zolar, arizalar va tadbir ishtirokchilari uchun <b>CSV</b> tugmasi
        bor. Fayl Excel’da to‘g‘ri ochilishi uchun UTF-8 BOM bilan yoziladi, ko‘rinadigan
        ma’lumotlar doirasi esa rahbarning ruxsatlari bilan chegaralangan.
      </>
    ),
  },
  {
    q: "Interfeys tilini yoki mavzuni o‘zgartira olamanmi?",
    a: (
      <>
        Tungi va yorug‘ mavzu sarlavhadagi tugma bilan almashadi va tanlov qurilmada eslab qolinadi.
        Mavzu almashganda sahifa yumshoq aylana bilan yangilanadi; harakatni kamaytirish
        sozlamasi yoqilgan bo‘lsa, o‘tish darhol bo‘ladi.
      </>
    ),
  },
];

const SHORTCUTS: Array<[string, string]> = [
  ["⌘K / Ctrl K", "Qidiruv palitrasini ochish"],
  ["↑ ↓", "Natijalar orasida yurish"],
  ["↵", "Tanlangan sahifani ochish"],
  ["Esc", "Oynani yopish"],
];

const QUICK: Array<{ href: string; label: string; hint: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }> = [
  { href: "/clubs", label: "Klublar katalogi", hint: "22 yo‘nalish, filtr va saralash", icon: Users },
  { href: "/books", label: "Kutubxona", hint: "Bookonomics ro‘yxati", icon: Bookmark },
  { href: "/events", label: "Tadbirlar", hint: "Taqvim va obuna", icon: CalendarPlus },
  { href: "https://t.me/Tsue_clubs_bot", label: "Telegram bot", hint: "@Tsue_clubs_bot", icon: Send },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <div className="eyebrow">Yordam</div>
        <h1 className="display mt-3 text-[38px] leading-tight sm:text-[46px]">Qisqa qo‘llanma</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-muted)]">
          Platformadan kundalik foydalanish uchun eng ko‘p beriladigan savollar. Javob topilmasa,
          klub rahbariga yoki platforma administratoriga yozing.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.55fr_1fr]">
        <div className="border-t border-[color:var(--color-line)]">
          {FAQ.map((item) => (
            <details key={item.q} className="faq group border-b border-[color:var(--color-line)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4">
                <span className="text-[15px] font-semibold text-[color:var(--color-ink)]">{item.q}</span>
                <span aria-hidden className="faq-mark relative h-3 w-3 shrink-0">
                  <span className="absolute left-0 top-1/2 h-[1.5px] w-3 -translate-y-1/2 rounded bg-[color:var(--color-muted)]" />
                  <span className="absolute left-1/2 top-0 h-3 w-[1.5px] -translate-x-1/2 rounded bg-[color:var(--color-muted)] transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>
              <div className="faq-body pb-5 pr-8 text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
              Tezkor o‘tish
            </p>
            <div className="mt-3 flex flex-col">
              {QUICK.map((item) => {
                const Icon = item.icon;
                const external = item.href.startsWith("http");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="group flex items-center gap-3 border-t border-[color:var(--color-line)] py-3 first:border-0 first:pt-0"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[color:var(--color-surface-2)] text-[color:var(--color-ink-soft)]">
                      <Icon size={15} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-[color:var(--color-ink)]">{item.label}</span>
                      <span className="block text-[11.5px] text-[color:var(--color-muted)]">{item.hint}</span>
                    </span>
                    <ArrowUpRight size={13} className="text-[color:var(--color-muted-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
              <Command size={12} /> Klaviatura
            </p>
            <dl className="mt-3 space-y-2.5">
              {SHORTCUTS.map(([keys, label]) => (
                <div key={keys} className="flex items-center justify-between gap-3">
                  <dt className="text-[12.5px] text-[color:var(--color-ink-soft)]">{label}</dt>
                  <dd>
                    <kbd className="rounded-[5px] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[color:var(--color-muted)]">
                      {keys}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-start gap-2 rounded-[9px] bg-[color:var(--color-surface-2)] p-3 text-[11.5px] leading-relaxed text-[color:var(--color-muted)]">
              <Search size={13} className="mt-0.5 shrink-0" />
              Qidiruv o‘zbekcha apostroflarni ham tushunadi: <b>oʻ</b>, <b>o‘</b> va <b>o'</b> bir xil
              qabul qilinadi.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
