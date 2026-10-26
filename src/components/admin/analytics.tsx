import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small server-rendered charts for the admin dashboard.
 *
 * The panel answers two questions a club lead actually asks — "is interest
 * growing?" and "where are our members?" — with plain SVG-free markup, so the
 * dashboard stays a server component with no chart library and no client JS.
 */

export function ColumnChart({
  title,
  meta,
  points,
  unit = "",
}: {
  title: string;
  meta?: ReactNode;
  points: Array<{ label: string; value: number; hint?: string }>;
  unit?: string;
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const total = points.reduce((sum, point) => sum + point.value, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12px] font-semibold text-[color:var(--color-ink)]">{title}</p>
        <p className="text-[11px] text-[color:var(--color-muted)]">{meta ?? `${total}${unit ? ` ${unit}` : ""}`}</p>
      </div>
      <div className="mt-4 flex h-[104px] items-end gap-[3px] border-b border-[color:var(--color-line)] pb-px" role="img" aria-label={`${title}: ${total}${unit ? ` ${unit}` : ""}`}>
        {points.map((point, index) => {
          const height = point.value === 0 ? 2 : Math.max(6, Math.round((point.value / max) * 100));
          return (
            <span
              key={`${point.label}-${index}`}
              title={point.hint ?? `${point.label}: ${point.value}`}
              className={cn(
                "flex-1 rounded-[2px] transition-colors",
                point.value === 0
                  ? "bg-[color:var(--color-line)]"
                  : "bg-[color:color-mix(in_oklab,var(--color-green)_74%,transparent)] hover:bg-[color:var(--color-green)]",
              )}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.06em] text-[color:var(--color-muted-soft)]">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function BarList({
  title,
  meta,
  rows,
  empty,
}: {
  title: string;
  meta?: ReactNode;
  rows: Array<{ label: string; value: number; accent?: string | null; href?: string }>;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12px] font-semibold text-[color:var(--color-ink)]">{title}</p>
        {meta ? <p className="text-[11px] text-[color:var(--color-muted)]">{meta}</p> : null}
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-[12px] text-[color:var(--color-muted)]">{empty ?? "Ma’lumot yo‘q"}</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="flex w-[124px] shrink-0 items-center gap-2">
                {row.accent ? (
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: row.accent }} />
                ) : null}
                <span className="truncate text-[11.5px] text-[color:var(--color-ink-soft)]">{row.label}</span>
              </span>
              <span className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-[color:var(--color-surface-3)]">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--brand-green),var(--brand-green-deep))]"
                  style={{ width: `${Math.max(4, Math.round((row.value / max) * 100))}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right text-[11px] tabular-nums text-[color:var(--color-muted)]">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
