import { cn } from "@/lib/utils";
import { CoverArt } from "@/components/ui/cover-art";

type Props = {
  /** Publisher artwork in /public/books. When absent the drawn fallback is used. */
  coverUrl?: string | null;
  title: string;
  author?: string | null;
  from: string;
  to: string;
  /** Rendered width hint; the aspect ratio is always the 2:3 of a paperback. */
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Turn off for thumbnails inside tight rows. */
  shadow?: boolean;
};

/**
 * A book, drawn as an object rather than as a card.
 *
 * Three details make the difference between "an image in a box" and "a book on
 * a table", and all three are cheap:
 *
 *   · the aspect ratio of a real paperback (2:3), never a square tile;
 *   · a dark, narrow band on the left where the spine folds away from the
 *     light, so the cover reads as a volume with thickness;
 *   · a contact shadow that is tight and cool near the paper and soft further
 *     out, instead of one uniform `box-shadow` blur.
 *
 * The publisher's own cover is used whenever it exists. A library of coloured
 * rectangles with the title typed over them is a mock-up, and it looks like one.
 */
export function BookCover({
  coverUrl,
  title,
  author,
  from,
  to,
  className,
  sizes,
  priority = false,
  shadow = true,
}: Props) {
  return (
    <span className={cn("book-object block", shadow && "book-object--lifted", className)}>
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={author ? `${title} — ${author}` : title}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          draggable={false}
          className="book-object__art"
        />
      ) : (
        <CoverArt
          from={from}
          to={to}
          title={title}
          author={author}
          variant="lines"
          compact
          className="book-object__art rounded-none"
        />
      )}
      <span aria-hidden className="book-object__spine" />
      <span aria-hidden className="book-object__edge" />
    </span>
  );
}
