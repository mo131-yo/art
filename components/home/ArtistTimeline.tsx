"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Bar = {
  slug: string;
  name: string;
  birth: number;
  death: number;
  accent: string;
};

/**
 * 50 зураачийн амьдралын хугацааг нэг тэнхлэгт зэрэгцүүлсэн тууз.
 * Зураач бүр өөрийн төрсөн–нас барсан оны хооронд сунасан зураас.
 */
export default function ArtistTimeline({ bars }: { bars: Bar[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const min = Math.min(...bars.map((b) => b.birth));
  const max = Math.max(...bars.map((b) => b.death));
  const span = max - min;
  const pct = (year: number) => ((year - min) / span) * 100;

  // Аравны онгуудын шошго
  const decades: number[] = [];
  for (let d = Math.ceil(min / 50) * 50; d < max; d += 50) decades.push(d);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(ref.current!.querySelectorAll(".tl-row"), {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.02,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section className="py-24 px-6 md:px-10 max-w-[100rem] mx-auto">
      <h2 className="font-serif-display text-(length:--text-title) text-ink mb-3">Он цагийн туузанд</h2>
      <p className="text-muted mb-12 max-w-2xl">
        {bars.length} зураачийн амьдрал — {min}-аас {max} он хүртэл таван зууны урлагийн түүх.
      </p>

      <div ref={ref}>
        {/* Оны шугам */}
        <div className="relative h-6 mb-2 ml-32 md:ml-40">
          {decades.map((d) => (
            <span
              key={d}
              className="absolute label -translate-x-1/2"
              style={{ left: `${pct(d)}%` }}
            >
              {d}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {bars.map((b) => (
            <Link
              key={b.slug}
              href={`/artists/${b.slug}`}
              className="tl-row group flex items-center gap-3 hover:bg-raise rounded transition-colors"
            >
              <span className="w-32 md:w-40 shrink-0 text-right text-sm text-ink/70 group-hover:text-accent transition-colors truncate pr-1">
                {b.name}
              </span>
              <span className="relative flex-1 h-4">
                <span
                  className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full transition-all group-hover:h-[5px]"
                  style={{
                    left: `${pct(b.birth)}%`,
                    width: `${pct(b.death) - pct(b.birth)}%`,
                    background: b.accent,
                  }}
                />
              </span>
              <span className="w-24 shrink-0 label opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                {b.birth}–{b.death}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
