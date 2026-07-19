"use client";

import { createElement, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

type Props = {
  children: string;
  /** Ямар HTML tag болж render хийгдэх */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  /** true бол scroll хүлээхгүй, ачаалмагц тоглоно (hero гарчигт) */
  immediate?: boolean;
};

/** SplitText-ээр үг бүрийг доороос нь эргэлдүүлэн гаргаж ирнэ */
export default function RevealText({
  children,
  as = "h2",
  className,
  delay = 0,
  immediate = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const split = SplitText.create(ref.current, {
        type: "words,lines",
        linesClass: "overflow-hidden",
        mask: "lines",
      });

      gsap.from(split.words, {
        yPercent: 120,
        rotate: 3,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.045,
        delay,
        ...(immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: ref.current,
                start: "top 85%",
                once: true,
              },
            }),
      });

      return () => split.revert();
    },
    { scope: ref },
  );

  return createElement(as, { ref, className }, children);
}
