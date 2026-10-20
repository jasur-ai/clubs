import { cn } from "@/lib/utils";
import { CLUBS_WITH_DARK_EMBLEM } from "@/config/club-logos";

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
 * being squeezed into the same square. A soft shadow lifts the mark off the
 * card without drawing a box around it.
 */
export function ClubLogo({ name, logoUrl, accent = "#1f4a33", size = 44, className, rounded }: Props) {
  if (logoUrl) {
    const slug = logoUrl.split("/").pop()?.replace(/\.(png|jpe?g)$/i, "") ?? "";
    const darkSrc = CLUBS_WITH_DARK_EMBLEM.has(slug) ? logoUrl.replace(/\.(png|jpe?g)$/i, "-dark.png") : null;
    const style = {
      height: size,
      width: "auto",
      // wide wordmarks would push past the card edge at full height
      maxWidth: size * 1.6,
    } as const;
    const base = "w-auto select-none object-contain";

    return (
      <span className="inline-flex shrink-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn(base, darkSrc && "club-emblem-light", className)}
          style={style}
        />
        {darkSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={darkSrc}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(base, "club-emblem-dark", className)}
            style={style}
          />
        ) : null}
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
