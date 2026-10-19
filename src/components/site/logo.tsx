import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, invert = false, compact = false }: { className?: string; invert?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="TDIU Clubs — bosh sahifa">
      <span
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-[9px] border",
          invert ? "border-white/25 bg-white/10" : "border-[#0e3558] bg-[#0e3558]",
        )}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12Z" stroke="white" strokeWidth="1.4" />
          <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5v-12Z" stroke="white" strokeWidth="1.4" />
          <path d="M11 8h2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M11 12h2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn(compact ? "text-[14px]" : "text-[15px]", "font-extrabold tracking-tight", invert ? "text-white" : "text-[color:var(--color-ink)]")}>
          TDIU <span className={invert ? "text-white/70" : "text-[#104070]"}>Clubs</span>
        </span>
        <span className={cn("mt-1 text-[9px] font-semibold uppercase tracking-[0.16em]", invert ? "text-white/55" : "text-[color:var(--color-muted)]")}>
          Yoshlar ittifoqi
        </span>
      </span>
    </Link>
  );
}
