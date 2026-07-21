import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { getSearchDocs } from "@/lib/artworks";
import SiteHeader from "@/components/SiteHeader";
import RegisterServiceWorker from "@/components/pwa/RegisterServiceWorker";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Их мастерууд — Дэлхийн агуу зураачид",
    template: "%s — Их мастерууд",
  },
  description:
    "Дэлхийн бүх цаг үеийн агуу зураачид, тэдний гайхамшигт бүтээлүүдийг монгол хэлээр судлаарай.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Мастерууд",
  },
  other: {
    // Next нь mobile-web-app-capable гаргадаг; хуучин iOS Safari-д apple- prefix хэрэгтэй
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  // globals.css-ийн үндсэн --c-bg
  themeColor: "#0d0c0a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchDocs = await getSearchDocs();

  // `data-scroll-behavior="smooth"` нь Next.js 16-д шинэ: үүнгүйгээр навигаци
  // хийхэд globals.css-ийн `scroll-behavior: smooth` идэвхтэй үлдэж, хуудас
  // солигдоход дээш гүйлгэх нь удаашрдаг. Энэ атрибут нь Next.js-д навигацийн
  // үед түүнийг түр хэрэгсэхгүй байхыг зөвшөөрнө — anchor линк (/#artists)
  // дээр зөөлөн гүйлт хэвээр ажиллана.
  return (
    <html
      lang="mn"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <RegisterServiceWorker />
        <OfflineIndicator />
        <SiteHeader docs={searchDocs} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
