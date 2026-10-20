import type { Metadata } from "next";
import { Clock3, MessageSquare, ShieldCheck } from "lucide-react";
import { JoinForm } from "@/components/forms/join-form";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "A’zo bo‘lish",
  description: "TDIU klubiga ariza topshirish: bir daqiqada, Telegram orqali javob.",
};

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ club?: string }> }) {
  const params = await searchParams;
  const clubs = await db.club.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
      <div>
        <div className="eyebrow">A’zolik</div>
        <h1 className="display mt-3 text-[38px] leading-tight sm:text-[46px]">
          Bir ariza —<br />
          yangi jamoa.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[color:var(--color-muted)]">
          Shaklni to‘ldiring. Klub rahbari arizani ko‘rib chiqadi va Telegram orqali bog‘lanadi. Ariza bepul.
        </p>

        <ul className="mt-8 space-y-4">
          <Step icon={<Clock3 size={16} />} title="1 daqiqa" text="Forma qisqa: faqat a’zolik uchun zarur ma’lumotlar." />
          <Step icon={<MessageSquare size={16} />} title="2 ish kuni" text="Rahbar Telegram orqali javob beradi va suhbatga taklif qiladi." />
          <Step icon={<ShieldCheck size={16} />} title="Maxfiylik" text="Ma’lumotlar faqat klub a’zolik jarayonida ishlatiladi." />
        </ul>

        <div className="mt-8 rounded-[14px] border border-[color:var(--color-line)] bg-white p-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">Kimlar qabul qilinadi</h2>
          <ul className="mt-3 space-y-2 text-[13.5px] text-[color:var(--color-ink-soft)]">
            <li>TDIU bakalavriat va magistratura talabalari</li>
            <li>Klub yo‘nalishiga qiziqishi bo‘lgan har bir talaba</li>
            <li>Haftada kamida bir marta tadbirda qatnashishga tayyorlar</li>
          </ul>
        </div>
      </div>

      <JoinForm clubs={clubs} defaultClub={params.club} />
    </div>
  );
}

function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[color:var(--color-line)] bg-white text-[color:var(--color-link)]">
        {icon}
      </span>
      <div>
        <p className="text-[13.5px] font-semibold">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">{text}</p>
      </div>
    </li>
  );
}
