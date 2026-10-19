import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-block text-[11.5px] font-semibold text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]">
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[26px] leading-tight text-[color:var(--color-ink)]">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-[color:var(--color-muted)]">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Panel({ title, meta, action, children, className }: { title?: string; meta?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("overflow-hidden rounded-[12px] border border-[color:var(--color-line)] bg-white", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--color-line)] px-4 py-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[12.5px] font-semibold text-[color:var(--color-ink)]">{title}</h2>
            {meta && <span className="text-[11px] text-[color:var(--color-muted)]">{meta}</span>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    NEW: { label: "Yangi", cls: "bg-[#fdf3e7] text-[#8a5a14]" },
    IN_REVIEW: { label: "Ko‘rilmoqda", cls: "bg-[#eef2f7] text-[#3b5878]" },
    APPROVED: { label: "Tasdiqlangan", cls: "bg-[#eef7f0] text-[#2f6d43]" },
    REJECTED: { label: "Rad etilgan", cls: "bg-[#fbeeee] text-[#8f3b3b]" },
    ACTIVE: { label: "Faol", cls: "bg-[#eef7f0] text-[#2f6d43]" },
    BLOCKED: { label: "Bloklangan", cls: "bg-[#fbeeee] text-[#8f3b3b]" },
    PENDING: { label: "Kutilmoqda", cls: "bg-[#fdf3e7] text-[#8a5a14]" },
    PUBLISHED: { label: "E’lon qilingan", cls: "bg-[#eef7f0] text-[#2f6d43]" },
    DRAFT: { label: "Qoralama", cls: "bg-[#f1f4f8] text-[#3b5878]" },
    READING: { label: "O‘qilmoqda", cls: "bg-[#eef7f0] text-[#2f6d43]" },
    FINISHED: { label: "Yakunlangan", cls: "bg-[#f1f4f8] text-[#3b5878]" },
    CANCELLED: { label: "Bekor qilingan", cls: "bg-[#fbeeee] text-[#8f3b3b]" },
    PLANNED: { label: "Rejalashtirilgan", cls: "bg-[#f1f4f8] text-[#3b5878]" },
    ARCHIVED: { label: "Arxiv", cls: "bg-[#f1f4f8] text-[#3b5878]" },
  };
  const s = map[status] ?? { label: status, cls: "bg-[#f1f4f8] text-[#3b5878]" };
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold", s.cls)}>{s.label}</span>;
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-3 border-b border-[color:var(--color-line)] px-4 py-3 last:border-0", className)}>{children}</div>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">{children}</span>;
}
