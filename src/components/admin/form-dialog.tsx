"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";

export function FormDialog({
  label,
  title,
  description,
  children,
  variant = "primary",
}: {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`btn btn-sm ${variant === "primary" ? "btn-primary" : "btn-secondary"}`}
      >
        <Plus size={13} /> {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b1f33]/45 p-4 sm:p-8" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-[640px] rounded-[14px] bg-white shadow-[0_24px_60px_rgba(11,31,51,0.2)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between border-b border-[color:var(--color-line)] px-5 py-4">
              <div>
                <h2 className="font-serif text-[19px] leading-tight text-[color:var(--color-ink)]">{title}</h2>
                {description && <p className="mt-0.5 text-[11.5px] text-[color:var(--color-muted)]">{description}</p>}
              </div>
              <button onClick={() => setOpen(false)} aria-label="Yopish" className="text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]">
                <X size={17} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5" onClick={(e) => {
              const form = (e.target as HTMLElement).closest("form");
              if (form && (e.target as HTMLElement).tagName === "BUTTON" && (e.target as HTMLButtonElement).type === "submit") {
                setTimeout(() => setOpen(false), 400);
              }
            }}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
