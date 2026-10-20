import Link from "next/link";
import { cn } from "@/lib/utils";
import { YiEmblem } from "@/components/brand/marks";

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
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-[#0d1646] transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        style={{ width: compact ? 28 : 34, height: compact ? 28 : 34 }}
      >
        <YiEmblem style={{ height: compact ? 20 : 24, width: "auto" }} />
      </span>
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span
          className={cn(
            compact ? "text-[13.5px]" : "text-[15px]",
            "font-extrabold tracking-[-0.03em]",
            invert ? "text-white" : "text-[color:var(--color-ink)]",
          )}
        >
          TDIU
          <span className={cn("font-medium", invert ? "text-white/65" : "text-[color:var(--color-muted)]")}>
            {" "}
            Clubs
          </span>
        </span>
        <span
          className={cn(
            "mt-[5px] text-[8.5px] font-semibold uppercase tracking-[0.2em]",
            invert ? "text-white/50" : "text-[color:var(--color-muted-soft)]",
          )}
        >
          Yoshlar ittifoqi
        </span>
      </span>
    </Link>
  );
}
