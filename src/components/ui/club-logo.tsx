import { cn } from "@/lib/utils";

type Props = {
  name: string;
  logoUrl?: string | null;
  accent?: string;
  size?: number;
  className?: string;
  rounded?: string;
};

/**
 * Club emblem.
 *
 * The artwork is placed bare — no frame, no plate, no tile — and sized by its
 * height, so a wide wordmark and a circular badge both stay legible instead of
 * being squeezed into the same square.
 *
 * The same file is used in both themes: recolouring a club's own emblem is a
 * brand violation, so the mark keeps its real colours and a hairline halo does
 * the work of separating dark ink from a dark surface.
 */
export function ClubLogo({ name, logoUrl, accent = "#1f4a33", size = 44, className, rounded }: Props) {
  if (logoUrl) {
    const style = {
      height: size,
      width: "auto",
      // wide wordmarks would push past the card edge at full height
      maxWidth: size * 1.6,
    } as const;
    return (
      <span className="club-emblem inline-flex shrink-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn("w-auto select-none object-contain", className)}
          style={style}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-[color:color-mix(in_oklab,var(--club-accent)_10%,transparent)]",
        rounded ?? "rounded-[10px]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="font-serif leading-none" style={{ color: accent, fontSize: size * 0.44 }}>
        {name.slice(0, 1)}
      </span>
    </span>
  );
}
