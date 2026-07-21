"use client";

import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Masonry сүлжээний wrapper.
 *
 * Шүүлтүүр солигдоход сүлжээний өндөр эрс өөрчлөгддөг ч ScrollTrigger хуучин
 * хэмжээгээ санаж үлддэг — үүнээс болж parallax болон reveal-ууд буруу
 * байрлалд ажиллана. Тиймээс агуулга солигдох бүрд дахин хэмжүүлнэ.
 */
export default function WorksGrid({
  children,
  count,
}: {
  children: React.ReactNode;
  /** Энэ өөрчлөгдөх бүрд ScrollTrigger дахин хэмжинэ */
  count: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Зурагнууд lazy ачаалагддаг тул layout нэг frame-ийн дараа тогтоно
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(id);
    },
    { dependencies: [count], scope: ref },
  );

  return (
    <div ref={ref} className="columns-2 md:columns-3 xl:columns-4 gap-6">
      {children}
    </div>
  );
}
