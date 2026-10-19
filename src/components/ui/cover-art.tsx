import { cn } from "@/lib/utils";

type Props = {
  from: string;
  to: string;
  title: string;
  author?: string | null;
  variant?: string | null;
  className?: string;
  compact?: boolean;
  label?: string;
};

/**
 * Deterministic, image-free cover art.
 * Keeps the product fast and works offline in previews; can be replaced with
 * real artwork by adding `coverUrl` to Book/Event in a later iteration.
 */
export function CoverArt({ from, to, title, author, variant = "arc", className, compact = false, label }: Props) {
  return (
    <div
      className={cn("relative isolate flex overflow-hidden rounded-[12px] text-white", className)}
      style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)` }}
    >
      <Pattern variant={variant ?? "arc"} />
      <div className={cn("relative flex w-full flex-col justify-between", compact ? "p-3.5" : "p-5")}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
          {label ?? (author ? "Kitob" : "Tadbir")}
        </span>
        <div>
          <p className={cn("font-serif leading-tight", compact ? "text-[15px]" : "text-[22px]")}>{title}</p>
          {author && <p className="mt-1.5 text-[11px] text-white/75">{author}</p>}
        </div>
      </div>
    </div>
  );
}

function Pattern({ variant }: { variant: string }) {
  if (variant === "grid") {
    return (
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 200 260" preserveAspectRatio="none">
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="260" stroke="white" strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 32} x2="200" y2={i * 32} stroke="white" strokeWidth="1" />
        ))}
      </svg>
    );
  }
  if (variant === "lines") {
    return (
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 200 260" preserveAspectRatio="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="-20" y1={i * 24 + 12} x2="220" y2={i * 24 - 20} stroke="white" strokeWidth="1" />
        ))}
      </svg>
    );
  }
  if (variant === "dots") {
    return (
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 200 260">
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) => (
            <circle key={`${r}-${c}`} cx={20 + c * 32} cy={24 + r * 32} r="1.6" fill="white" />
          )),
        )}
      </svg>
    );
  }
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 200 260" preserveAspectRatio="none">
      <circle cx="185" cy="10" r="95" fill="none" stroke="white" strokeWidth="1" />
      <circle cx="185" cy="10" r="132" fill="none" stroke="white" strokeWidth="1" />
      <circle cx="185" cy="10" r="170" fill="none" stroke="white" strokeWidth="1" />
    </svg>
  );
}
