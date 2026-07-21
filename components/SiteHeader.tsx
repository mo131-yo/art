"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CommandPalette, { type SearchDoc } from "./CommandPalette";

const LINKS = [
  { href: "/artists", label: "Зураачид" },
  { href: "/works", label: "Бүтээлүүд" },
  { href: "/movements", label: "Хөдөлгөөн" },
];

/**
 * Гүйхэд дэвсгэр нь тунгалагаас бүдэг болно — эс бөгөөс гэрэл зурган дээр
 * цэсний текст уншигдахгүй болдог.
 */
export default function SiteHeader({ docs }: { docs: SearchDoc[] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <nav
        className={`flex items-center justify-between px-6 py-4 md:px-10 transition-colors duration-300 ${
          scrolled
            ? "bg-bg/80 backdrop-blur-md border-b border-line"
            : "bg-linear-to-b from-black/60 to-transparent"
        }`}
      >
        <Link
          href="/"
          className="font-serif-display text-lg tracking-[0.25em] uppercase text-ink hover:text-accent transition-colors"
        >
          Их мастерууд
        </Link>

        <div className="flex items-center gap-5 md:gap-7">
          <div className="hidden sm:flex items-center gap-5 md:gap-7">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="label hover:text-accent transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <CommandPalette docs={docs} />
        </div>
      </nav>
    </header>
  );
}
