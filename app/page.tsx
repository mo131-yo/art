import Image from "next/image";
import Link from "next/link";
import { artists, getArtist } from "@/lib/artists";
import RevealText from "@/components/gsap/RevealText";
import FadeIn from "@/components/gsap/FadeIn";

/** Hero хэсэгт хөвөх онцлох зургууд */
const heroWorks = [
  { slug: "van-gogh", workId: "starry-night", speed: "0.8", className: "top-[12%] left-[4%] w-40 md:w-64 rotate-[-4deg]" },
  { slug: "hokusai", workId: "great-wave", speed: "1.15", className: "top-[8%] right-[6%] w-44 md:w-72 rotate-[3deg]" },
  { slug: "vermeer", workId: "girl-with-pearl-earring", speed: "0.9", className: "bottom-[10%] left-[10%] w-32 md:w-48 rotate-[2deg]" },
  { slug: "klimt", workId: "the-kiss", speed: "1.1", className: "bottom-[14%] right-[12%] w-36 md:w-56 rotate-[-3deg]" },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {heroWorks.map((hw) => {
          const artist = getArtist(hw.slug)!;
          const work = artist.notableWorks.find((w) => w.id === hw.workId)!;
          return (
            <div
              key={hw.workId}
              data-speed={hw.speed}
              className={`absolute ${hw.className} opacity-40 md:opacity-60 shadow-2xl shadow-black/60`}
            >
              <Image
                src={work.image}
                alt={work.titleMn}
                width={400}
                height={Math.round(400 / work.aspect)}
                className="w-full h-auto rounded-sm"
                priority
              />
            </div>
          );
        })}

        <div className="relative z-10 text-center px-6">
          <FadeIn y={20}>
            <p className="text-sm md:text-base tracking-[0.4em] uppercase text-muted mb-6">
              Бүх цаг үеийн
            </p>
          </FadeIn>
          <RevealText
            as="h1"
            immediate
            delay={0.2}
            className="font-serif-display text-6xl md:text-9xl leading-none text-ink"
          >
            Их мастерууд
          </RevealText>
          <FadeIn y={20} delay={0.9}>
            <p className="mt-8 max-w-xl mx-auto text-lg text-muted leading-relaxed">
              Дэлхийн урлагийн түүхийг бүтээсэн 16 агуу зураач — тэдний амьдрал,
              бүтээлүүдийг монгол хэлээр нээж мэдээрэй.
            </p>
          </FadeIn>
          <FadeIn y={20} delay={1.2}>
            <Link
              href="#artists"
              className="inline-block mt-10 border border-accent/60 text-accent px-8 py-3 tracking-[0.2em] uppercase text-sm hover:bg-accent hover:text-bg transition-colors rounded-full"
            >
              Танилцах
            </Link>
          </FadeIn>
        </div>

        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-bg pointer-events-none" />
      </section>

      {/* ЗУРААЧДЫН GRID */}
      <section id="artists" className="px-6 md:px-10 py-24 max-w-7xl mx-auto">
        <RevealText as="h2" className="font-serif-display text-4xl md:text-6xl mb-4 text-ink">
          Зураачид
        </RevealText>
        <FadeIn y={20}>
          <p className="text-muted max-w-2xl mb-16">
            Сэргэн мандалтаас экспрессионизм хүртэл — он цагийн дарааллаар.
          </p>
        </FadeIn>

        <FadeIn stagger=".artist-card" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <Link
              key={artist.slug}
              href={`/artists/${artist.slug}`}
              className="artist-card group relative overflow-hidden rounded-lg bg-surface border border-white/5 hover:border-(--card-accent) transition-colors duration-500"
              style={{ "--card-accent": artist.palette.accent } as React.CSSProperties}
            >
              <div className="aspect-3/4 overflow-hidden">
                <Image
                  src={artist.portrait}
                  alt={artist.nameMn}
                  width={450}
                  height={600}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-5 pt-16">
                <div className="text-xs tracking-[0.2em] uppercase" style={{ color: artist.palette.accent }}>
                  {artist.movement}
                </div>
                <h3 className="font-serif-display text-2xl text-white mt-1">{artist.nameMn}</h3>
                <div className="text-sm text-white/60 mt-1">
                  {artist.birthYear}–{artist.deathYear} · {artist.nationality}
                </div>
              </div>
            </Link>
          ))}
        </FadeIn>
      </section>
    </div>
  );
}
