import type { MetadataRoute } from "next";

/**
 * Installable web app: students add the platform to their home screen once and
 * open it like an app, which matters more than any single extra feature when the
 * alternative is typing a URL between classes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TDIU Clubs — talabalar klublari",
    short_name: "TDIU Clubs",
    description: "Klublar, tadbirlar, kutubxona va tadbirlar taqvimi — O‘zbekiston Yoshlar ittifoqi bilan hamkorlikda.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#efece3",
    theme_color: "#0f6b39",
    lang: "uz",
    categories: ["education", "social"],
    icons: [
      { src: "/brand/yi-icon-180.png", sizes: "180x180", type: "image/png" },
      { src: "/brand/yi-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcuts: [
      { name: "Tadbirlar", url: "/events" },
      { name: "Klublar", url: "/clubs" },
      { name: "Saqlanganlar", url: "/saqlangan" },
    ],
  };
}
