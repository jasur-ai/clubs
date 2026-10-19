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
 * Club emblem. Renders the club's own artwork when it exists (seeded from the
 * club's Telegram channel) and falls back to a typographic monogram otherwise.
 */
export function ClubLogo({ name, logoUrl, accent = "#104070", size = 44, className, rounded = "rounded-[10px]" }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-[color:var(--color-line)] bg-white",
        rounded,
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-[3px]"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-serif text-white"
          style={{ background: accent, fontSize: size * 0.42 }}
        >
          {name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}
