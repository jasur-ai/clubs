import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, ListChecks, Timer } from "lucide-react";
import { FitFinder } from "@/components/site/fit-finder";
import { getDiscoveryClubs } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Menga mos klubni topish",
  description: "To‘rt savolga javob bering — yo‘nalish, ritm va maqsadingizga mos TDIU klublarini toping.",
};

export default async function FitFinderPage() {
  const clubs = await getDiscoveryClubs();

  const pool = clubs.map((club) => ({
    slug: club.slug,
    name: club.name,
    tagline: club.tagline,
    summary: club.summary,
    category: club.category,
    accent: club.accent,
    logoUrl: club.logoUrl,
    members: club.members,
    meetingDay: club.meetingDay,
    activity: club.activity,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <nav className="text-[12px] text-[color:var(--color-muted)]">
            <Link href="/clubs" className="hover:text-[color:var(--color-ink)]">
              Klublar
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[color:var(--color-ink-soft)]">Menga mos klub</span>
          </nav>

          <div className="eyebrow mt-6">Tanlov</div>
          <h1 className="display mt-3 text-[36px] leading-[1.05] sm:text-[44px]">
            22 klub orasidan
            <br />
            o‘zingiznikini toping
          </h1>
          <p className="mt-4 max-w-[440px] text-[14.5px] leading-relaxed text-[color:var(--color-muted)]">
            To‘rt savol — taxminan bir daqiqa. Natija yo‘nalish bo‘yicha moslik va klubning bugungi
            faolligiga qarab saralanadi. Hisob kerak emas, javoblar qurilmadan chiqmaydi.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex gap-3">
              <Timer size={16} className="mt-0.5 shrink-0 text-[color:var(--color-green)]" strokeWidth={1.9} />
              <div>
                <p className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">Bir daqiqa</p>
                <p className="text-[12.5px] text-[color:var(--color-muted)]">To‘rt savol, orqaga qaytish imkoniyati bilan.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <ListChecks size={16} className="mt-0.5 shrink-0 text-[color:var(--color-green)]" strokeWidth={1.9} />
              <div>
                <p className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">Tekshirilgan ma’lumot</p>
                <p className="text-[12.5px] text-[color:var(--color-muted)]">
                  Uchrashuv kuni, a’zolar soni va tadbirlar — bazadan, qo‘lda yozilgan ro‘yxatdan emas.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Compass size={16} className="mt-0.5 shrink-0 text-[color:var(--color-green)]" strokeWidth={1.9} />
              <div>
                <p className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">Keyingi qadam tayyor</p>
                <p className="text-[12.5px] text-[color:var(--color-muted)]">
                  Natijadan to‘g‘ridan-to‘g‘ri solishtirish yoki ariza topshirish.
                </p>
              </div>
            </li>
          </ul>

          <Link href="/clubs" className="link-quiet mt-8 inline-flex text-[13px]">
            Katalogni ko‘rish <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="rounded-[18px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <FitFinder clubs={pool} />
        </div>
      </div>
    </div>
  );
}
