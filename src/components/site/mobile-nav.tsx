"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/clubs", label: "Klublar" },
  { href: "/books", label: "Kutubxona" },
  { href: "/events", label: "Tadbirlar" },
  { href: "/news", label: "Yangiliklar" },
];

export function MobileNav({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[color:var(--color-line)] bg-white"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-[color:var(--color-line)] bg-white p-4 shadow-[var(--shadow-pop)]">
          <nav className="flex flex-col divide-y divide-[color:var(--color-line)]">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-medium text-[color:var(--color-ink)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href={authed ? "/app" : "/login"} onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full">
            {authed ? "Kabinet" : "Kirish"}
          </Link>
        </div>
      )}
    </div>
  );
}
