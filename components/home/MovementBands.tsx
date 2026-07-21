import Link from "next/link";
import Image from "next/image";
import { populatedMovements } from "@/lib/movements";
import { getArtistWorks } from "@/lib/artworks";
import { commons } from "@/lib/data/types";
import RevealText from "@/components/gsap/RevealText";
import FadeIn from "@/components/gsap/FadeIn";

/** Урлагийн гол хөдөлгөөнүүд — тус бүр төлөөлөх бүтээлийн дэвсгэртэй */
export default async function MovementBands() {
  const movements = populatedMovements();
  const cards = await Promise.all(
    movements.slice(0, 8).map(async (m) => {
      const cover = (await getArtistWorks(m.artists[0].slug))[0] ?? null;
      return { ...m, cover };
    }),
  );

  return (
    <section className="py-24 px-6 md:px-10 max-w-[100rem] mx-auto">
      <RevealText as="h2" className="font-serif-display text-(length:--text-title) text-ink mb-3">
        Хөдөлгөөнүүд
      </RevealText>
      <p className="text-muted mb-12 max-w-2xl">
        Сэргэн мандалтаас модернизм хүртэл — ертөнцийг харах шинэ арга бүр.
      </p>

      <FadeIn stagger=".mv-card" className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {cards.map((m) => (
          <Link
            key={m.slug}
            href={`/movements/${m.slug}`}
            className="mv-card group relative aspect-4/5 overflow-hidden rounded-lg border border-line"
          >
            {m.cover && (
              <Image
                src={commons(m.cover.fileName, 500)}
                alt=""
                fill
                unoptimized
                className="object-cover opacity-50 grayscale group-hover:opacity-70 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${m.artists[0].palette.bg} 15%, transparent 70%)`,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="label" style={{ color: m.artists[0].palette.accent }}>
                {m.period}
              </p>
              <h3 className="font-serif-display text-xl md:text-2xl text-white mt-1 leading-tight">
                {m.name}
              </h3>
              <p className="label pt-1 text-white/50">{m.artists.length} зураач</p>
            </div>
          </Link>
        ))}
      </FadeIn>
    </section>
  );
}
