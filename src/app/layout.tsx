import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { RevealObserver } from "@/components/site/motion";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TDIU Clubs — talabalar klublari platformasi",
    template: "%s · TDIU Clubs",
  },
  description:
    "Toshkent davlat iqtisodiyot universiteti klublari: tadbirlar, kitobxonlik dasturi, muhokamalar va a'zolik uchun yagona platforma. O‘zbekiston Yoshlar ittifoqi bilan hamkorlikda.",
  applicationName: "TDIU Clubs",
  keywords: ["TDIU", "TSUE", "klublar", "Book Club", "talabalar", "tadbirlar", "Yoshlar ittifoqi"],
  authors: [{ name: "TDIU Yoshlar ittifoqi" }],
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: "TDIU Clubs",
    title: "TDIU Clubs — talabalar klublari platformasi",
    description: "22 klub, bitta platforma. Tadbirlar, kitobxonlik va muhokamalar.",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/brand/yi-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/yi-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/yi-icon-180.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8edf4" },
    { media: "(prefers-color-scheme: dark)", color: "#080f22" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const themeScript = `(function(){try{var s=localStorage.getItem('tdiu-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.classList.add('js');}catch(e){document.documentElement.dataset.theme='light';document.documentElement.classList.add('js');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uz"
      data-theme="light"
      suppressHydrationWarning
      className={`${manrope.variable} ${fraunces.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <RevealObserver />
        {children}
      </body>
    </html>
  );
}
