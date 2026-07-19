"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Доороос дээш гулсах зай (px) */
  y?: number;
  delay?: number;
  /** CSS selector — шууд хүүхдүүдийг дараалан гаргах бол (ж: ".card") */
  stagger?: string;
};

/** Scroll хийхэд зөөлөн orж ирэх wrapper */
export default function FadeIn({ children, className, y = 48, delay = 0, stagger }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const targets = stagger ? ref.current.querySelectorAll(stagger) : ref.current;

      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay,
        stagger: stagger ? 0.08 : 0,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          once: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
