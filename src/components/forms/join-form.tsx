"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { submitJoinRequest, type JoinState } from "@/app/actions/join";
import { Field } from "@/components/ui/primitives";
import Link from "next/link";

type Club = { slug: string; name: string };

const initial: JoinState = {};

export function JoinForm({ clubs, defaultClub }: { clubs: Club[]; defaultClub?: string }) {
  const [state, action, pending] = useActionState(submitJoinRequest, initial);

  if (state.ok) {
    return (
      <div className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-8 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 size={22} />
        </span>
        <h2 className="mt-4 font-serif text-[24px]">Ariza yuborildi</h2>
        <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">
          Klub rahbari 2 ish kuni ichida Telegram orqali bog‘lanadi. Holatni kuzatish uchun mini-ilovaga kiring.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/app" className="btn btn-primary btn-sm">Mini-ilova</Link>
          <Link href="/clubs" className="btn btn-secondary btn-sm">Klublar</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-[16px] border border-[color:var(--color-line)] bg-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Klub" htmlFor="clubSlug" className="sm:col-span-2" error={state.fieldErrors?.clubSlug}>
          <select id="clubSlug" name="clubSlug" defaultValue={defaultClub ?? "book-club"} className="select" required>
            {clubs.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="To‘liq ism" htmlFor="fullName" error={state.fieldErrors?.fullName}>
          <input id="fullName" name="fullName" className="input" placeholder="Familiya Ism Sharif" autoComplete="name" required />
        </Field>

        <Field label="Fakultet" htmlFor="faculty" error={state.fieldErrors?.faculty}>
          <input id="faculty" name="faculty" className="input" placeholder="Iqtisodiyot fakulteti" required />
        </Field>

        <Field label="Kurs" htmlFor="course" error={state.fieldErrors?.course}>
          <select id="course" name="course" className="select" required defaultValue="">
            <option value="" disabled>Tanlang</option>
            <option value="1">1-kurs</option>
            <option value="2">2-kurs</option>
            <option value="3">3-kurs</option>
            <option value="4">4-kurs</option>
            <option value="mag">Magistratura</option>
          </select>
        </Field>

        <Field label="Guruh" htmlFor="group" hint="Ixtiyoriy" error={state.fieldErrors?.group}>
          <input id="group" name="group" className="input" placeholder="IE-24" />
        </Field>

        <Field label="Telefon" htmlFor="phone" error={state.fieldErrors?.phone}>
          <input id="phone" name="phone" className="input" placeholder="+998 90 123 45 67" inputMode="tel" autoComplete="tel" required />
        </Field>

        <Field label="Telegram" htmlFor="telegram" hint="Masalan: @username" error={state.fieldErrors?.telegram}>
          <input id="telegram" name="telegram" className="input" placeholder="@username" required />
        </Field>

        <Field label="Motivatsiya" htmlFor="motivation" hint="Nima uchun bu klub? (ixtiyoriy)" className="sm:col-span-2" error={state.fieldErrors?.motivation}>
          <textarea id="motivation" name="motivation" className="textarea" rows={4} placeholder="Qisqa yozing." />
        </Field>
      </div>

      <label className="mt-5 flex items-start gap-3 text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-[#104070]" required />
        <span>Ma’lumotlarim klub a’zolik jarayoni uchun ishlatilishiga roziman.</span>
      </label>
      {state.fieldErrors?.consent && (
        <p className="mt-1 text-xs font-medium text-[color:var(--color-danger)]">{state.fieldErrors.consent}</p>
      )}

      {state.error && (
        <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {state.error}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full">
        {pending ? "Yuborilmoqda…" : "Arizani yuborish"}
      </button>
      <p className="mt-3 text-center text-[11.5px] text-[color:var(--color-muted)]">
        Yuborish bilan siz klub qoidalariga rozilik bildirasiz.
      </p>
    </form>
  );
}
