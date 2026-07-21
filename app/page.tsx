import Image from "next/image";
import Link from "next/link";
import { artists } from "@/lib/artists";
import { getShowcase, totalWorks } from "@/lib/artworks";
import { populatedMovements } from "@/lib/movements";
import { commons } from "@/lib/data/types";
import RevealText from "@/components/gsap/RevealText";
import FadeIn from "@/components/gsap/FadeIn";
import StatsBar from "@/components/home/StatsBar";
import FeaturedRail from "@/components/home/FeaturedRail";
import MovementBands from "@/components/home/MovementBands";
import ArtistTimeline from "@/components/home/ArtistTimeline";

export default async function Home() {
  // Hero-д хөвөх зургууд — алдартай бүтээлүүдээс
  const showcase = await getShowcase(6);
  const heroWorks = showcase.slice(0, 4);
  const heroClasses = [
    "top-[12%] left-[4%] w-40 md:w-60 rotate-[-4deg]",
    "top-[8%] right-[6%] w-44 md:w-64 rotate-[3deg]",
    "bottom-[10%] left-[10%] w-32 md:w-48 rotate-[2deg]",
    "bottom-[14%] right-[12%] w-36 md:w-52 rotate-[-3deg]",
  ];
  const heroSpeeds = ["0.8", "1.15", "0.9", "1.1"];

  const total = await totalWorks();
  const movementCount = populatedMovements().length;
  const centuries = Math.ceil((artists.at(-1)!.deathYear - artists[0].birthYear) / 100);

  const bars = artists.map((a) => ({
    slug: a.slug,
    name: a.nameMn,
    birth: a.birthYear,
    death: a.deathYear,
    accent: a.palette.accent,
  }));

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {heroWorks.map((w, i) => (
          <div
            key={w.id}
            data-speed={heroSpeeds[i]}
            className={`absolute ${heroClasses[i]} opacity-40 md:opacity-60 shadow-2xl shadow-black/60`}
          >
            <Image
              src={commons(w.fileName, 640)}
              alt=""
              width={400}
              height={Math.round(400 / (w.aspect || 1))}
              priority
              className="w-full h-auto rounded-sm"
            />
          </div>
        ))}

        <div className="relative z-10 text-center px-6">
          <FadeIn y={20}>
            <p className="label mb-6" style={{ letterSpacing: "0.4em" }}>
              Бүх цаг үеийн
            </p>
          </FadeIn>
          <RevealText
            as="h1"
            immediate
            delay={0.2}
            className="font-serif-display text-(length:--text-display) leading-none text-ink"
          >
            Их мастерууд
          </RevealText>
          <FadeIn y={20} delay={0.9}>
            <p className="mt-8 max-w-xl mx-auto text-(length:--text-lede) text-muted leading-relaxed">
              Дэлхийн урлагийн түүхийг бүтээсэн {artists.length} агуу зураач, тэдний{" "}
              {total.toLocaleString("mn-MN")} бүтээлийг монгол хэлээр нээж мэдээрэй.
            </p>
          </FadeIn>
          <FadeIn y={20} delay={1.2}>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/artists"
                className="inline-block border border-accent/60 text-accent px-8 py-3 label hover:bg-accent hover:text-bg transition-colors rounded-full"
              >
                Зураачид
              </Link>
              <Link
                href="/works"
                className="inline-block border border-line text-ink/80 px-8 py-3 label hover:border-accent/50 transition-colors rounded-full"
              >
                Бүтээлүүд үзэх
              </Link>
            </div>
          </FadeIn>
        </div>

        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-bg pointer-events-none" />
      </section>

      {/* ТООЦОО */}
      <StatsBar
        stats={[
          { value: total, label: "Бүтээл" },
          { value: artists.length, label: "Зураач" },
          { value: centuries, label: "Зуун" },
          { value: movementCount, label: "Хөдөлгөөн" },
        ]}
      />

      {/* ОНЦЛОХ БҮТЭЭЛҮҮД */}
      <FeaturedRail />

      {/* ХӨДӨЛГӨӨНҮҮД */}
      <MovementBands />

      {/* ОН ЦАГИЙН ТУУЗ */}
      <ArtistTimeline bars={bars} />

      {/* БҮХ ЗУРААЧ РУУ */}
      <section className="py-24 px-6 md:px-10 max-w-[100rem] mx-auto text-center border-t border-line">
        <RevealText as="h2" className="font-serif-display text-(length:--text-title) text-ink">
          {`${artists.length} мастер, нэг ертөнц`}
        </RevealText>
        <FadeIn y={20} className="mt-8">
          <Link
            href="/artists"
            className="inline-block border border-accent/60 text-accent px-8 py-3 label hover:bg-accent hover:text-bg transition-colors rounded-full"
          >
            Бүх зураачийг үзэх →
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
