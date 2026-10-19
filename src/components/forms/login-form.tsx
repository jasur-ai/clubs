"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Field } from "@/components/ui/primitives";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" className="input" placeholder="admin@clubs.tdiu.uz" required autoComplete="email" />
      </Field>
      <Field label="Parol" htmlFor="password">
        <input id="password" name="password" type="password" className="input" required autoComplete="current-password" />
      </Field>
      {state.error && (
        <div className="flex items-start gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {state.error}
        </div>
      )}
      <button disabled={pending} className="btn btn-primary w-full">
        {pending ? "Kirish…" : "Kirish"}
      </button>
    </form>
  );
}
