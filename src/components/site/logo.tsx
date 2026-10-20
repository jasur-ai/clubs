import Link from "next/link";
import { cn } from "@/lib/utils";
import { YiEmblem } from "@/components/brand/marks";

/**
 * Header lockup. The official swoosh sits bare on the surface — no plate — with
 * the product name set beside it. Below `md` the name keeps its two lines but
 * loses tracking so it never wraps.
 */
export function Logo({
  className,
  invert = false,
  compact = false,
}: {
  className?: string;
  invert?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="TDIU Clubs — bosh sahifa"
    >
      <YiEmblem
        className="shrink-0 transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-[1.06]"
        style={{ height: compact ? 28 : 34, width: "auto" }}
      />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span
          className={cn(
            compact ? "text-[13.5px]" : "text-[15.5px]",
            "font-extrabold tracking-[-0.03em]",
            invert ? "text-white" : "text-[color:var(--color-ink)]",
          )}
        >
          TDIU
          <span className={cn("font-medium", invert ? "text-white/60" : "text-[color:var(--color-muted)]")}>
            {" "}
            Clubs
          </span>
        </span>
        <span
          className={cn(
            "mt-[5px] text-[8.5px] font-semibold uppercase tracking-[0.19em]",
            invert ? "text-white/45" : "text-[color:var(--color-muted-soft)]",
          )}
        >
          Yoshlar ittifoqi
        </span>
      </span>
    </Link>
  );
}
