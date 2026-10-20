import { cn } from "@/lib/utils";

/**
 * Official O'zbekiston Yoshlar ittifoqi artwork, keyed to transparency from the
 * club network's own logo file. Nothing here is redrawn: `yi-emblem.png` is the
 * swoosh cropped out of the official lockup, `yoshlar-ittifoqi-mark.png` is the
 * full official lockup.
 */
export function YiEmblem({
  className,
  style,
  alt = "",
}: {
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/yi-emblem.png"
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("select-none", className)}
      style={style}
      draggable={false}
      decoding="async"
    />
  );
}

/**
 * Compact signature: the official emblem at its real proportions next to a
 * typographic name. Used where the full lockup would render too small to read —
 * the mark itself is never redrawn.
 */
export function YiSignature({ className, emblem = 30 }: { className?: string; emblem?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[#0d1646]"
        style={{ width: emblem, height: emblem }}
      >
        <YiEmblem style={{ height: emblem * 0.7, width: "auto" }} />
      </span>
      <span className="text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.14em]">
        O‘zbekiston
        <br />
        Yoshlar ittifoqi
      </span>
    </span>
  );
}

/** Full official lockup: emblem + "O'zbekiston Yoshlar ittifoqi" wordmark. */
export function YoshlarIttifoqiLockup({
  className,
  height = 40,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span className={cn("inline-flex items-center", className)} style={{ height }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/yoshlar-ittifoqi-lockup@3x.png"
        alt="O‘zbekiston Yoshlar ittifoqi"
        style={{ height: "100%", width: "auto" }}
        decoding="async"
        draggable={false}
      />
    </span>
  );
}
