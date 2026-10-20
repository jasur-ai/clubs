import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Send } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { demoLoginAction } from "@/app/actions/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Kirish" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const demoEnabled = process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_LOGIN === "1";
  const [superAdmin, clubAdmin, demoStudent] = demoEnabled
    ? await Promise.all([
        db.user.findFirst({ where: { role: "SUPER_ADMIN" }, select: { email: true, firstName: true, role: true } }),
        db.user.findFirst({ where: { role: "CLUB_ADMIN" }, select: { email: true, firstName: true, role: true } }),
        db.user.findFirst({ where: { role: "MEMBER" }, select: { email: true, firstName: true, role: true } }),
      ])
    : [null, null, null];
  const demoAccounts = [superAdmin, clubAdmin, demoStudent].filter(Boolean) as Array<{
    email: string | null;
    firstName: string;
    role: string;
  }>;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-start lg:py-20">
      <div>
        <div className="eyebrow">Hisob</div>
        <h1 className="display mt-3 text-[36px] leading-tight sm:text-[44px]">Platformaga kirish</h1>
        <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-[color:var(--color-muted)]">
          Talabalar Telegram orqali, klub rahbarlari va muharrirlar email orqali kiradi.
        </p>

        <a
          href="https://t.me/tsuebookclub"
          target="_blank"
          rel="noreferrer"
          className="mt-7 flex items-center justify-between rounded-[14px] border border-[color:var(--color-line)] bg-white p-4 transition-colors hover:border-[color:var(--color-line-strong)]"
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#e8f1fb] text-[#2070d0]">
              <Send size={18} />
            </span>
            <span>
              <span className="block text-[13.5px] font-semibold">Telegram orqali kirish</span>
              <span className="mt-0.5 block text-[12px] text-[color:var(--color-muted)]">Mini-ilova orqali avtomatik</span>
            </span>
          </span>
          <ArrowRight size={16} className="text-[color:var(--color-muted)]" />
        </a>

        <div className="mt-6 rounded-[14px] border border-[color:var(--color-line)] bg-white p-5">
          <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
            <ShieldCheck size={15} className="text-[color:var(--color-link)]" /> Boshqaruv uchun
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
            Klub rahbari, muharrir va platforma administratori email va parol bilan kiradi.
          </p>
          <div className="mt-4">
            <LoginForm next={next} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {demoEnabled && (
          <div className="rounded-[16px] border border-[color:var(--color-warning-line)] bg-[color:var(--color-warning-bg)]/60 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-warning)]">Demo kirish</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[color:var(--color-warning)]/80">
              Sandbox uchun. Parolni bilmasdan rollarni ko‘rish imkoniyati. Productionda o‘chiriladi.
            </p>
            <div className="mt-4 space-y-2">
              {demoAccounts.map((u) => (
                <form key={u.email} action={demoLoginAction}>
                  <input type="hidden" name="email" value={u.email ?? ""} />
                  <button className="flex w-full items-center justify-between rounded-[10px] border border-[color:var(--color-warning-line)] bg-white px-3.5 py-2.5 text-left text-[12.5px] font-medium text-[color:var(--color-warning)] hover:border-[color:var(--color-warning)]">
                    <span>
                      {u.firstName} ·{" "}
                      {u.role === "SUPER_ADMIN" ? "Platforma admini" : u.role === "CLUB_ADMIN" ? "Klub rahbari" : "Talaba"}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-5">
          <h2 className="text-[13.5px] font-semibold">Rollar</h2>
          <ul className="mt-3 space-y-3 text-[12.5px] text-[color:var(--color-muted)]">
            <li>
              <span className="font-semibold text-[color:var(--color-ink)]">Platforma administratori</span> — barcha klublar,
              a’zolik so‘rovlari, kontent va statistika.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-ink)]">Klub rahbari</span> — faqat o‘z klubi: a’zolar,
              tadbirlar, kutubxona.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-ink)]">Muharrir</span> — yangiliklar va e’lonlar.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-ink)]">Talaba</span> — mini-ilova: o‘qish, RSVP, muhokama.
            </li>
          </ul>
        </div>

        <p className="text-center text-[11.5px] text-[color:var(--color-muted)]">
          Muammo bo‘lsa: <Link href="/about" className="font-semibold underline">platforma haqida</Link>
        </p>
      </div>
    </div>
  );
}
