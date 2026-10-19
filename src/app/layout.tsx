import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

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
    "Toshkent davlat iqtisodiyot universiteti klublari: tadbirlar, kitobxonlik dasturi, muhokamalar va a'zolik uchun yagona platforma.",
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
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#104070",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${manrope.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
