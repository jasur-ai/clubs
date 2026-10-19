"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProgressAction } from "@/app/actions/member";

export function ProgressForm({ cycleId, initial, pages }: { cycleId: string; initial: number; pages: number | null }) {
  const [percent, setPercent] = useState(initial);
  const pageCount = pages ? Math.round((pages * percent) / 100) : null;

  return (
    <form action={updateProgressAction} className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-4">
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="percent" value={percent} />

      <div className="flex items-end justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-muted)]">O‘qilgan qism</span>
        <span className="font-serif text-[30px] leading-none">{percent}%</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={percent}
        onChange={(e) => setPercent(Number(e.target.value))}
        className="mt-4 w-full accent-[#104070]"
        aria-label="O‘qish foizi"
      />
      <div className="mt-1 flex justify-between text-[10px] text-[color:var(--color-muted)]">
        <span>0%</span>
        {pageCount !== null && <span>{pageCount} / {pages} bet</span>}
        <span>100%</span>
      </div>

      <div className="mt-4">
        <label htmlFor="note" className="label">Izoh (ixtiyoriy)</label>
        <input id="note" name="note" maxLength={280} className="input" placeholder="Qaysi bobda to‘xtadingiz?" />
      </div>

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn btn-accent mt-3 w-full">
      {pending ? "Saqlanmoqda…" : "Saqlash"}
    </button>
  );
}
