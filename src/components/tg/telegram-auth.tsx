"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { telegramLoginAction } from "@/app/actions/auth";

type TG = { ready: () => void; expand: () => void; initData?: string };

export function TelegramAuth() {
  const [state, setState] = useState<"loading" | "error" | "outside">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: TG } }).Telegram?.WebApp;
    if (!tg || !tg.initData) {
      setState("outside");
      return;
    }
    tg.ready();
    tg.expand();

    (async () => {
      const res = await telegramLoginAction(tg.initData!);
      if (res.ok) {
        window.location.replace("/app");
      } else {
        setMessage(res.error ?? "Kirish amalga oshmadi");
        setState("error");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[color:var(--color-paper)] px-6 text-center">
      {state === "loading" && (
        <>
          <Loader2 className="animate-spin text-[color:var(--color-link)]" size={26} />
          <p className="mt-4 text-[13px] text-[color:var(--color-muted)]">Telegram hisobi tekshirilmoqda…</p>
        </>
      )}
      {state === "outside" && (
        <div className="max-w-sm">
          <p className="font-serif text-[22px] text-[color:var(--color-ink)]">Mini-ilova Telegram ichida ochiladi</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-muted)]">
            Sayt orqali davom etish uchun hisobingizga kiring yoki Telegram botdan mini-ilovani oching.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/login" className="btn btn-primary btn-sm">Kirish</Link>
            <Link href="/" className="btn btn-secondary btn-sm">Bosh sahifa</Link>
          </div>
        </div>
      )}
      {state === "error" && (
        <div className="max-w-sm">
          <p className="font-serif text-[22px]">Kirish amalga oshmadi</p>
          <p className="mt-2 text-[13px] text-[color:var(--color-muted)]">{message}</p>
          <Link href="/login" className="btn btn-secondary btn-sm mt-4">Sayt orqali kirish</Link>
        </div>
      )}
    </div>
  );
}
