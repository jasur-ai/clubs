"use client";

import { useRef } from "react";

/**
 * Select that submits its enclosing form as soon as a value changes —
 * keeps member/role management to a single click.
 */
export function InlineSelect({
  name,
  defaultValue,
  options,
  className,
  label,
}: {
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLSelectElement>(null);
  return (
    <select
      ref={ref}
      name={name}
      defaultValue={defaultValue}
      aria-label={label}
      onChange={() => ref.current?.form?.requestSubmit()}
      className={className ?? "h-8 rounded-[6px] border border-[color:var(--color-line)] bg-white px-2 text-[11.5px] text-[color:var(--color-ink-soft)] focus:border-[#104070] focus:outline-none"}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
