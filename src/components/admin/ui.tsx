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
    NEW: { label: "Yangi", cls: "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]" },
    IN_REVIEW: { label: "Ko‘rilmoqda", cls: "bg-[color:var(--color-surface-3)] text-[color:var(--color-ink-soft)]" },
    APPROVED: { label: "Tasdiqlangan", cls: "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]" },
    REJECTED: { label: "Rad etilgan", cls: "bg-[color:var(--color-danger-bg)] text-[color:var(--color-danger)]" },
    ACTIVE: { label: "Faol", cls: "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]" },
    BLOCKED: { label: "Bloklangan", cls: "bg-[color:var(--color-danger-bg)] text-[color:var(--color-danger)]" },
    PENDING: { label: "Kutilmoqda", cls: "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]" },
    PUBLISHED: { label: "E’lon qilingan", cls: "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]" },
    DRAFT: { label: "Qoralama", cls: "bg-[color:var(--color-surface-3)] text-[color:var(--color-ink-soft)]" },
    READING: { label: "O‘qilmoqda", cls: "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]" },
    FINISHED: { label: "Yakunlangan", cls: "bg-[color:var(--color-surface-3)] text-[color:var(--color-ink-soft)]" },
    CANCELLED: { label: "Bekor qilingan", cls: "bg-[color:var(--color-danger-bg)] text-[color:var(--color-danger)]" },
    PLANNED: { label: "Rejalashtirilgan", cls: "bg-[color:var(--color-surface-3)] text-[color:var(--color-ink-soft)]" },
    ARCHIVED: { label: "Arxiv", cls: "bg-[color:var(--color-surface-3)] text-[color:var(--color-ink-soft)]" },
  };
  const s = map[status] ?? { label: status, cls: "bg-[color:var(--color-surface-3)] text-[color:var(--color-ink-soft)]" };
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold", s.cls)}>{s.label}</span>;
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-3 border-b border-[color:var(--color-line)] px-4 py-3 last:border-0", className)}>{children}</div>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">{children}</span>;
}
