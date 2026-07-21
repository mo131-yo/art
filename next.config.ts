import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    /*
     * Зургийн optimizer-ийг бүрэн унтраана.
     *
     * Wikimedia өөрөө `?width=` параметрээр CDN thumbnail үүсгэж өгдөг тул
     * дахин хувиргах шаардлагагүй. Мөн optimizer дундуур явуулбал СЕРВЕР
     * Wikimedia-аас татаж, нэг IP-аас олон хүсэлт явуулснаар 429 иддэг
     * (browser-ээс шууд татахад ийм асуудал гардаггүй). Vercel дээр 23,000
     * зургийн хувиргалтын төлбөр ч гарахгүй.
     *
     * Энэ нь компонент бүрд `unoptimized` prop бичихээс илүү найдвартай —
     * шинэ <Image> нэмэхэд мартах боломжгүй.
     */
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
