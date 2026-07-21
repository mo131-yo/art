"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Stat = { value: number; label: string; suffix?: string };

/** Дэлгэц рүү орж ирэхэд тоонууд 0-ээс өсөх зурвас */
export default function StatsBar({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const nums = ref.current!.querySelectorAll<HTMLElement>("[data-value]");
      nums.forEach((el) => {
        const end = Number(el.dataset.value);
        const obj = { n: 0 };
        gsap.to(obj, {
          n: end,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.firstChild!.textContent = Math.round(obj.n).toLocaleString("mn-MN");
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="border-y border-line">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-line">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-10 text-center">
            <p className="font-serif-display text-4xl md:text-6xl text-accent">
              <span data-value={s.value}>0</span>
              {s.suffix}
            </p>
            <p className="label pt-2">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
