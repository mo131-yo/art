"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

/**
 * GSAP ScrollSmoother-ээр зөөлөн scroll. data-speed атрибуттай элементүүд
 * автоматаар parallax болно (effects: true).
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      ScrollSmoother.create({
        wrapper: wrapper.current!,
        content: wrapper.current!.firstElementChild as HTMLElement,
        smooth: 1.2,
        smoothTouch: 0.1,
        effects: true,
      });
    },
    { scope: wrapper },
  );

  return (
    <div ref={wrapper}>
      <div>{children}</div>
    </div>
  );
}
