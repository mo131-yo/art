import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { populatedMovements } from "@/lib/movements";
import { getArtistWorks } from "@/lib/artworks";
import { commons } from "@/lib/data/types";
import RevealText from "@/components/gsap/RevealText";
import FadeIn from "@/components/gsap/FadeIn";

export const metadata: Metadata = {
  title: "Хөдөлгөөнүүд",
  description: "Сэргэн мандалтаас модернизм хүртэл урлагийн гол урсгалууд — монголоор.",
};

export default async function MovementsPage() {
  const movements = populatedMovements();

  // Хөдөлгөөн бүрт төлөөлөх зураг: тэргүүлэх зураачийн хамгийн алдартай бүтээл
  const cards = await Promise.all(
    movements.map(async (m) => {
      const lead = m.artists[0];
      const works = await getArtistWorks(lead.slug);
      return { ...m, cover: works[0] ?? null, lead };
    }),
  );

  return (
    <div className="bg-bg text-ink min-h-screen">
      <div className="px-6 md:px-10 pt-32 pb-24 max-w-[100rem] mx-auto">
        <header className="mb-12">
          <p className="label">Урсгалууд</p>
          <RevealText
            as="h1"
            immediate
            className="font-serif-display text-(length:--text-title) leading-[1.05] mt-3"
          >
            Хөдөлгөөнүүд
          </RevealText>
          <p className="mt-4 text-muted max-w-2xl text-(length:--text-lede) leading-relaxed">
            Урлагийн түүх бол хэв маягуудын дараалал. Гэрэл, өнгө, хэлбэрийн шинэ ойлголт тус бүр
            ертөнцийг харах шинэ аргыг авчирсан.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((m) => (
            <FadeIn key={m.slug} y={30}>
              <Link
                href={`/movements/${m.slug}`}
                className="group grid grid-cols-[7rem_1fr] sm:grid-cols-[10rem_1fr] gap-5 items-stretch border border-line rounded-lg overflow-hidden hover:border-accent/40 transition-colors"
                style={{ "--card-accent": m.artists[0].palette.accent } as React.CSSProperties}
              >
                <div className="relative overflow-hidden bg-raise">
                  {m.cover && (
                    <Image
                      src={commons(m.cover.fileName, 400)}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  )}
                </div>
                <div className="py-5 pr-5">
                  <p className="label" style={{ color: "var(--card-accent)" }}>
                    {m.period}
                  </p>
                  <h2 className="font-serif-display text-2xl md:text-3xl mt-1 group-hover:text-accent transition-colors">
                    {m.name}
                  </h2>
                  <p className="text-sm text-muted mt-2 line-clamp-3 leading-relaxed">
                    {m.description}
                  </p>
                  <p className="label pt-3">{m.artists.length} зураач</p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
