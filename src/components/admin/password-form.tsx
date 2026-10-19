"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { changePasswordAction, type PasswordState } from "@/app/actions/admin";
import { FieldLabel } from "@/components/admin/ui";

const initial: PasswordState = {};

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);

  return (
    <form action={action} className="space-y-3 p-4">
      <div>
        <FieldLabel>Joriy parol</FieldLabel>
        <input name="current" type="password" className="input" required autoComplete="current-password" />
      </div>
      <div>
        <FieldLabel>Yangi parol</FieldLabel>
        <input name="next" type="password" className="input" required minLength={10} autoComplete="new-password" />
      </div>
      <div>
        <FieldLabel>Yangi parol (takror)</FieldLabel>
        <input name="repeat" type="password" className="input" required minLength={10} autoComplete="new-password" />
      </div>

      {state.error && (
        <p className="flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-start gap-2 rounded-[8px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Parol yangilandi
        </p>
      )}

      <button disabled={pending} className="btn btn-secondary w-full">
        {pending ? "Saqlanmoqda…" : "Parolni yangilash"}
      </button>
      <p className="text-[11px] leading-relaxed text-[color:var(--color-muted)]">
        Kamida 10 belgi, joriy paroldan farqli. O‘zgarish audit jurnaliga yoziladi.
      </p>
    </form>
  );
}
