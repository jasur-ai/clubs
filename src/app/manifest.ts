import type { MetadataRoute } from "next";

/**
 * Installable web app manifest.
 *
 * Most students arrive on a phone from Telegram; installing the portal to the
 * home screen is the closest thing to an app store listing we need, and it
 * costs one file.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TDIU Clubs — Yoshlar ittifoqi",
    short_name: "TDIU Clubs",
    description: "TDIU talabalar klublari: katalog, tadbirlar, kutubxona va mini-ilova.",
    start_url: "/",
    display: "standalone",
    background_color: "#efece3",
    theme_color: "#0f6b39",
    lang: "uz",
    icons: [
      { src: "/brand/yi-icon-180.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/brand/yi-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    shortcuts: [
      { name: "Klublar", url: "/clubs", description: "Barcha klublar katalogi" },
      { name: "Bu hafta", url: "/haftalik", description: "Kelasi yetti kun" },
      { name: "Saqlanganlar", url: "/saqlangan", description: "Xatcho‘plar" },
    ],
  };
}
