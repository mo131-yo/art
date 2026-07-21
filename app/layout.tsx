import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { getSearchDocs } from "@/lib/artworks";
import SiteHeader from "@/components/SiteHeader";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchDocs = await getSearchDocs();

  return (
    <html lang="mn" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader docs={searchDocs} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
