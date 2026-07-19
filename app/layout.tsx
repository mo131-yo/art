import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <header className="fixed top-0 inset-x-0 z-50">
          <nav className="flex items-center justify-between px-6 py-4 md:px-10 bg-linear-to-b from-black/60 to-transparent">
            <Link
              href="/"
              className="font-serif-display text-lg tracking-[0.25em] uppercase text-ink hover:text-accent transition-colors"
            >
              Их мастерууд
            </Link>
            <Link
              href="/#artists"
              className="text-sm tracking-widest uppercase text-muted hover:text-accent transition-colors"
            >
              Зураачид
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
