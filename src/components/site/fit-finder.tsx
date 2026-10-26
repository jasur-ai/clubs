"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { ClubLogo } from "@/components/ui/club-logo";
import { cn } from "@/lib/utils";
import type { ClubCategory } from "@/config/clubs";

type Option = {
  label: string;
  hint?: string;
  weights: Partial<Record<ClubCategory, number>>;
};

type Question = {
  id: string;
  title: string;
  caption?: string;
  options: Option[];
};

export type FinderClub = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  category: string;
  accent: string;
  logoUrl: string | null;
  members: number;
  meetingDay: string | null;
  activity: number;
};

const QUESTIONS: Question[] = [
  {
    id: "energy",
    title: "Bo‘sh vaqtingizda nima qilasiz?",
    caption: "Bir javob tanlang — bu eng muhim signal.",
    options: [
      { label: "Kitob o‘qiyman, muhokama qilaman", weights: { intellectual: 3, academic: 1 } },
      { label: "Bahslashaman, fikr isbotlayman", weights: { intellectual: 2, social: 2 } },
      { label: "Yangi narsa yasayman yoki yozaman", weights: { creative: 3, social: 1 } },
      { label: "Harakatdaman — sport, sayohat, o‘yin", weights: { sport: 3, travel: 1 } },
    ],
  },
  {
    id: "skill",
    title: "Qaysi ko‘nikmani kuchaytirmoqchisiz?",
    options: [
      { label: "Tahlil va tanqidiy fikrlash", weights: { intellectual: 3, academic: 1 } },
      { label: "Notiqlik va jamoa boshqaruvi", weights: { social: 3, academic: 1 } },
      { label: "Texnologiya va kasb ko‘nikmalari", weights: { academic: 3, intellectual: 1 } },
      { label: "Jismoniy tayyorgarlik va intizom", weights: { sport: 3 } },
    ],
  },
  {
    id: "rhythm",
    title: "Qanday ritm sizga mos?",
    options: [
      { label: "Haftada bir marta chuqur uchrashuv", weights: { intellectual: 2, academic: 2 } },
      { label: "Tez-tez, qisqa va jonli", weights: { social: 2, sport: 2 } },
      { label: "Loyiha ustida uzoq muddat ishlash", weights: { academic: 2, creative: 2 } },
      { label: "Safar va tashriflar", weights: { travel: 3 } },
    ],
  },
  {
    id: "goal",
    title: "Bu yilgi maqsadingiz?",
    options: [
      { label: "Do‘stlar orttirish va tarmoq qurish", weights: { social: 3 } },
      { label: "Portfolio va amaliy tajriba", weights: { academic: 2, creative: 2 } },
      { label: "Musobaqalarda g‘alaba", weights: { intellectual: 2, sport: 2 } },
      { label: "Yangi joylarni ko‘rish", weights: { travel: 3 } },
    ],
  },
];

const CATEGORY_TITLES: Record<ClubCategory, string> = {
  intellectual: "Intellektual",
  academic: "Akademik",
  creative: "Ijodiy",
  sport: "Sport",
  social: "Ijtimoiy",
  travel: "Sayohat",
};

/**
 * "Which club fits me?" — the question every first-year student asks at the
 * involvement fair. Four questions, weights per category, then a ranked shortlist
 * with a one-tap way to compare or apply. Everything runs in the browser; nothing
 * is stored and no account is needed.
 */
export function FitFinder({ clubs }: { clubs: FinderClub[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const scores = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const question of QUESTIONS) {
      const choice = answers[question.id];
      if (choice === undefined) continue;
      const option = question.options[choice];
      for (const [category, weight] of Object.entries(option.weights)) {
        byCategory.set(category, (byCategory.get(category) ?? 0) + (weight ?? 0));
      }
    }
    return byCategory;
  }, [answers]);

  const ranked = useMemo(() => {
    if (Object.keys(answers).length < QUESTIONS.length) return [];
    return clubs
      .map((club) => {
        const categoryScore = scores.get(club.category) ?? 0;
        const activity = club.activity / 100;
        return { club, score: categoryScore * 10 + activity * 4 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [answers, clubs, scores]);

  const done = Object.keys(answers).length === QUESTIONS.length;
  const question = QUESTIONS[step];
  const chosen = answers[question?.id];

  if (done) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Natija</p>
            <h2 className="display mt-2 text-[26px] leading-tight sm:text-[30px]">Sizga mos klublar</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setStep(0);
            }}
            className="btn btn-ghost btn-sm"
          >
            <RotateCcw size={13} /> Qaytadan
          </button>
        </div>

        <ol className="mt-6 space-y-3">
          {ranked.map((entry, index) => (
            <li
              key={entry.club.slug}
              className="flex flex-wrap items-center gap-4 rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-line-strong)]"
              style={{ "--club-accent": entry.club.accent } as React.CSSProperties}
            >
              <span className="w-5 text-[12px] font-semibold tabular-nums text-[color:var(--color-muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <ClubLogo name={entry.club.name} logoUrl={entry.club.logoUrl} accent={entry.club.accent} size={38} />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[17px] leading-tight text-[color:var(--color-ink)]">{entry.club.name}</p>
                <p className="mt-0.5 line-clamp-1 text-[12.5px] text-[color:var(--color-muted)]">{entry.club.tagline}</p>
              </div>
              <span className="rounded-full border border-[color:var(--color-line)] px-2.5 py-1 text-[11px] text-[color:var(--color-muted)]">
                {CATEGORY_TITLES[entry.club.category as ClubCategory] ?? entry.club.category}
              </span>
              <div className="flex gap-2">
                <Link href={`/clubs/${entry.club.slug}`} className="btn btn-secondary btn-sm">
                  Ochish
                </Link>
                <Link href={`/join?club=${entry.club.slug}`} className="btn btn-primary btn-sm">
                  Ariza
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/clubs/solishtirish?clubs=${ranked.slice(0, 3).map((entry) => entry.club.slug).join(",")}`}
            className="btn btn-secondary btn-sm"
          >
            Top 3 ni solishtirish <ArrowRight size={14} />
          </Link>
          <Link href="/clubs" className="btn btn-ghost btn-sm">
            Butun katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {QUESTIONS.map((item, index) => (
          <span
            key={item.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              answers[item.id] !== undefined
                ? "bg-[color:var(--color-green)]"
                : index === step
                  ? "bg-[color:color-mix(in_oklab,var(--color-green)_40%,var(--color-surface-3))]"
                  : "bg-[color:var(--color-surface-3)]",
            )}
          />
        ))}
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
        {step + 1} / {QUESTIONS.length}
      </p>
      <h2 className="display mt-2 text-[24px] leading-tight sm:text-[28px]">{question.title}</h2>
      {question.caption && <p className="mt-1.5 text-[13px] text-[color:var(--color-muted)]">{question.caption}</p>}

      <div className="mt-5 grid gap-2">
        {question.options.map((option, index) => {
          const active = chosen === index;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                setAnswers((prev) => ({ ...prev, [question.id]: index }));
                if (step < QUESTIONS.length - 1) window.setTimeout(() => setStep(step + 1), 160);
              }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[11px] border px-4 py-3 text-left text-[13.5px] transition-all duration-200",
                active
                  ? "border-[color:color-mix(in_oklab,var(--color-green)_45%,var(--color-line))] bg-[color:color-mix(in_oklab,var(--color-green)_8%,var(--color-surface))] text-[color:var(--color-ink)]"
                  : "border-[color:var(--color-line)] bg-[color:var(--color-surface)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-line-strong)] hover:bg-[color:var(--color-surface-2)]",
              )}
              aria-pressed={active}
            >
              <span>{option.label}</span>
              {active ? (
                <Check size={15} className="shrink-0 text-[color:var(--color-green)]" strokeWidth={2.4} />
              ) : (
                <ArrowRight size={14} className="shrink-0 text-[color:var(--color-muted-soft)]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)] disabled:opacity-40"
        >
          <ArrowLeft size={13} /> Orqaga
        </button>
        <button
          type="button"
          onClick={() => setStep((value) => Math.min(QUESTIONS.length - 1, value + 1))}
          disabled={chosen === undefined || step === QUESTIONS.length - 1}
          className="btn btn-secondary btn-sm disabled:opacity-40"
        >
          Keyingisi <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
