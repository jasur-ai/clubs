import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "navy";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white text-[color:var(--color-ink-soft)] border-[color:var(--color-line)]",
    accent: "bg-[color-mix(in_oklab,var(--club-accent)_8%,white)] text-[color:var(--club-accent)] border-[color-mix(in_oklab,var(--club-accent)_24%,white)]",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-800 border-red-200",
    navy: "bg-[#0e3558] text-white border-transparent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({
  first,
  last,
  src,
  size = 36,
  className,
}: {
  first: string;
  last?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const label = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className={cn("rounded-full object-cover", className)} />;
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#e9eef4] font-semibold text-[#104070]",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.34) }}
      aria-hidden
    >
      {label}
    </span>
  );
}

export function ProgressBar({
  value,
  className,
  tone = "accent",
  showLabel = false,
}: {
  value: number;
  className?: string;
  tone?: "accent" | "navy" | "light";
  showLabel?: boolean;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const bg =
    tone === "light" ? "bg-white/25" : tone === "navy" ? "bg-[#dbe4ee]" : "bg-[color-mix(in_oklab,var(--club-accent)_14%,white)]";
  const fg = tone === "light" ? "bg-white" : tone === "navy" ? "bg-[#104070]" : "bg-[var(--club-accent)]";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("h-1.5 w-full overflow-hidden rounded-full", bg)}>
        <div className={cn("h-full rounded-full transition-[width] duration-500", fg)} style={{ width: `${v}%` }} />
      </div>
      {showLabel && <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums">{v}%</span>}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">{label}</div>
      <div className="mt-1 font-serif text-2xl leading-none text-[color:var(--color-ink)]">{value}</div>
      {hint && <div className="mt-1 text-xs text-[color:var(--color-muted)]">{hint}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[color:var(--color-line-strong)] bg-white px-6 py-12 text-center">
      {icon && <div className="mb-3 text-[color:var(--color-muted)]">{icon}</div>}
      <p className="text-sm font-semibold text-[color:var(--color-ink)]">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-[color:var(--color-muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h2 className="display text-[26px] text-[color:var(--color-ink)] sm:text-[32px]">{title}</h2>
        {description && <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--color-muted)]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-ink)] transition-colors hover:text-[var(--club-accent)]",
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn("field", className)}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="text-xs font-medium text-[color:var(--color-danger)]">{error}</span>}
    </div>
  );
}

export function Callout({
  tone = "neutral",
  title,
  children,
}: {
  tone?: "neutral" | "accent" | "warning";
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    neutral: "border-[color:var(--color-line)] bg-white",
    accent: "border-[color-mix(in_oklab,var(--club-accent)_25%,white)] bg-[color-mix(in_oklab,var(--club-accent)_6%,white)]",
    warning: "border-amber-200 bg-amber-50",
  };
  return (
    <div className={cn("rounded-[12px] border p-4 text-sm leading-relaxed text-[color:var(--color-ink-soft)]", tones[tone])}>
      {title && <p className="mb-1 font-semibold text-[color:var(--color-ink)]">{title}</p>}
      {children}
    </div>
  );
}
