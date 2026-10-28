import { cn } from "@/lib/utils";
import { CLUBS_WITH_INK_EMBLEM, inkEmblemLift } from "@/config/club-logos";

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
 *
 * One image, one set of colours: the emblem is identical in light and dark
 * themes. Dark ink marks are lifted in brightness on the dark surface so they
 * stay readable; nothing is recoloured, inverted or tinted, and no blurred halo
 * is drawn around them — a glow at this size destroys the small lettering.
 */
export function ClubLogo({ name, logoUrl, accent = "#1f4a33", size = 44, className, rounded }: Props) {
  if (logoUrl) {
    const slug = logoUrl.split("/").pop()?.replace(/\.(png|jpe?g)$/i, "") ?? "";
    const ink = CLUBS_WITH_INK_EMBLEM.has(slug);
    const style = {
      height: size,
      width: "auto",
      // wide wordmarks would push past the card edge at full height
      maxWidth: size * 1.6,
      ...(ink ? { "--emblem-lift": inkEmblemLift(slug) } : {}),
    } as React.CSSProperties & { height: number; width: string; maxWidth: number };

    return (
      <span className="inline-flex shrink-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn("club-emblem w-auto select-none object-contain", ink && "club-emblem--ink", className)}
          style={style}
        />
      </span>
    );
  }

  // No emblem yet: a monogram, set bare. A tinted square here only produces the
  // empty tile the emblems were freed from, and every club on the site now has
  // real artwork — a letter in the club's ink reads as a mark, not a placeholder.
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="font-serif leading-none tracking-tight"
        style={{ color: "var(--club-accent-ink, " + accent + ")", fontSize: size * 0.62 }}
      >
        {name.slice(0, 1)}
      </span>
    </span>
  );
}
