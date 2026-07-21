import type { MetadataRoute } from "next";

/**
 * `/manifest.webmanifest` — үүнгүйгээр browser апп суулгах саналыг гаргахгүй.
 * Өнгө нь `app/globals.css`-ийн үндсэн палетртай нийцнэ (`--c-bg`, `--c-accent`).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Их мастерууд — Дэлхийн агуу зураачид",
    short_name: "Мастерууд",
    description:
      "50 их мастерын 23,000 бүтээлийг монгол хэлээр. Офлайнд ч ажиллана.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0d0c0a",
    theme_color: "#0d0c0a",
    lang: "mn",
    dir: "ltr",
    categories: ["education", "entertainment", "books"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Зураачид", url: "/artists" },
      { name: "Бүтээлүүд", url: "/works" },
      { name: "Дуртай", url: "/favorites" },
    ],
  };
}
