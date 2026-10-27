import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

type Props = {
  /** A real picture — a book cover, or a photograph of the event. */
  imageUrl?: string | null;
  title: string;
  publishedAt?: Date | null;
  section?: string | null;
  accent?: string | null;
  /** `card` is the 132-px band on a news card; `wide` is the article hero. */
  size?: "card" | "wide";
  className?: string;
  priority?: boolean;
};

/**
 * The picture at the top of a news item.
 *
 * Two honest states, and no third:
 *
 *   · a story about a book shows that book — the publisher's own cover, sitting
 *     on the page as an object rather than stretched to fill a banner;
 *   · a story without a picture gets a *plate*: the publication date set as a
 *     poster, in the same type and brass rules as the rest of the site.
 *
 * The third state — a coloured gradient with the title typed over it — was what
 * stood here before, and it was the reason these cards read as unfinished. A
 * placeholder that pretends to be a photograph is worse than an honest composi-
 * tion, so the fallback is a designed one: real data, real rules, no stock
 * photography of an event that never had a photographer.
 */
export function NewsMedia({
  imageUrl,
  title,
  publishedAt,
  section,
  accent,
  size = "card",
  className,
  priority = false,
}: Props) {
  if (imageUrl) {
    return (
      <span className={cn("news-media news-media--object", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={cn(
            "news-media__object",
            size === "wide" ? "max-h-[88%] max-w-[78%]" : "max-h-[84%] max-w-[74%]",
          )}
        />
      </span>
    );
  }

  const when = publishedAt ?? new Date();
  const day = formatDate(when, "d");
  const month = formatDate(when, "MMMM");
  const year = formatDate(when, "yyyy");

  return (
    <span
      className={cn("news-media news-media--plate", size === "wide" && "px-8 py-7", className)}
      style={{ "--plate-accent": accent ?? "var(--color-green)" } as React.CSSProperties}
    >
      <span className="news-plate__mark">TDIU · Yoshlar ittifoqi</span>

      <span className="news-plate__date">
        <span className={cn("news-plate__day", size === "wide" && "text-[74px]")}>{day}</span>
        <span className="news-plate__month">
          {month}
          <span className="news-plate__year">{year}</span>
        </span>
      </span>

      <span className="news-plate__foot">
        <span aria-hidden className="news-plate__rule" />
        {section ?? "Yangiliklar"}
      </span>

      <span aria-hidden className="news-plate__frame" title={title} />
    </span>
  );
}
