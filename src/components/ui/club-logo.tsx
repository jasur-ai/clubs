import { cn } from "@/lib/utils";
import { CLUBS_WITH_DARK_EMBLEM } from "@/config/club-logos";

type Props = {
  name: string;
  logoUrl?: string | null;
  accent?: string;
  /** Height of the artwork in pixels. Width follows the emblem's own aspect. */
  size?: number;
  className?: string;
  /** Kept for call-site compatibility: the artwork is never framed anymore. */
  rounded?: string;
};

/**
 * Club emblem.
 *
 * The artwork is shown bare and at its own proportions — no frame, no plate and
 * no padded square, which is what used to leave an empty gutter around narrow
 * lockups. Each emblem also ships a lightened twin (`<slug>-dark.png`) so the
 * dark theme can swap the ink instead of forcing a white tile behind it.
 */
export function ClubLogo({ name, logoUrl, accent = "#3f5c34", size = 44, className }: Props) {
  if (!logoUrl) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[8px] font-serif text-white",
          className,
        )}
        style={{ width: size, height: size, background: accent, fontSize: size * 0.42 }}
        aria-hidden
      >
        {name.slice(0, 1)}
      </span>
    );
  }

  const slug = logoUrl.split("/").pop()?.replace(/\.(png|jpe?g)$/i, "") ?? "";
  const darkSrc = CLUBS_WITH_DARK_EMBLEM.has(slug)
    ? logoUrl.replace(/\.(png|jpe?g)$/i, "-dark.png")
    : null;

  return (
    <span className="inline-flex shrink-0" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn(
          "w-auto max-w-[132px] select-none object-contain",
          darkSrc && "club-emblem-light",
          className,
        )}
        style={{ height: size }}
      />
      {darkSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={darkSrc}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn("club-emblem-dark w-auto max-w-[132px] select-none object-contain", className)}
          style={{ height: size }}
        />
      ) : null}
    </span>
  );
}
