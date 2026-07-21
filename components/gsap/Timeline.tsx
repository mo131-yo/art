"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { TimelineEvent } from "@/lib/artists";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Зураачийн амьдралын он дараалал: босоо шугам scroll-ийг дагаж зурагдаж,
 * үйл явдлууд ээлжлэн хоёр талаас орж ирнэ.
 */
export default function Timeline({ events }: { events: TimelineEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".tl-line", {
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          end: "bottom 60%",
          scrub: 1,
        },
      });

      gsap.utils.toArray<HTMLElement>(".tl-item").forEach((item, i) => {
        gsap.from(item, {
          x: i % 2 === 0 ? -40 : 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="relative">
      <div className="tl-line absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-accent/60 md:-translate-x-px" />
      <ol className="space-y-12">
        {events.map((ev, i) => (
          // Нэг онд хоёр үйл явдал болсон тохиолдол бий (ж: Боттичелли 1482)
          // тул зөвхөн он key болгоход хангалтгүй.
          <li
            key={`${ev.year}-${i}`}
            className={`tl-item relative pl-12 md:pl-0 md:w-[calc(50%-2.5rem)] ${
              i % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto"
            }`}
          >
            <span
              className={`absolute left-4 md:left-auto top-1.5 size-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-accent/20 ${
                i % 2 === 0
                  ? "md:-right-10 md:translate-x-1/2"
                  : "md:-left-10 md:-translate-x-1/2"
              }`}
            />
            <div className="font-serif-display text-accent text-2xl">
              {ev.year}
              <span className="text-muted text-sm font-sans ml-3">
                {ev.age > 0 ? `${ev.age} настай` : ""}
              </span>
            </div>
            <h3 className="mt-1 text-lg font-semibold text-ink">{ev.title}</h3>
            <p className="mt-1 text-muted leading-relaxed">{ev.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
