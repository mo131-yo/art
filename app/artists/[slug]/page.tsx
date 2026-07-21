import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { artists, getArtist } from "@/lib/artists";
import { getArtistWorks } from "@/lib/artworks";
import { commons } from "@/lib/data/types";
import RevealText from "@/components/gsap/RevealText";
import FadeIn from "@/components/gsap/FadeIn";
import Timeline from "@/components/gsap/Timeline";
import ArtworkCard from "@/components/browse/ArtworkCard";
import SaveOfflineButton from "@/components/pwa/SaveOfflineButton";

export function generateStaticParams() {
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) return {};
  return {
    title: artist.nameMn,
    description: artist.tagline,
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();

  const allWorks = await getArtistWorks(slug);
  // Гараар бичсэн бүтээлүүд доор тусад нь дэлгэрэнгүй гардаг тул энд давхардуулахгүй.
  // Тайлбар бичээгүй зураачдад хамгийн алдартай бүтээлүүд нь энэ хэсгийг дүүргэнэ.
  const more = allWorks.filter((w) => !w.featured).slice(0, 12);
  const heroWork = allWorks[0] ?? null;
  const p = artist.palette;

  // Офлайнд татах жагсаалт: топ 60 бүтээлийн зураг + хуудас, зураачийн 2 хуудас.
  // Серверт бэлдэж өгнө — client талд бүтээлийн жагсаалт байхгүй.
  const offlineWorks = allWorks.slice(0, 60);
  const offlineUrls = [
    `/artists/${slug}`,
    `/artists/${slug}/works`,
    ...offlineWorks.map((w) => `/artists/${slug}/artwork/${w.id}`),
    ...offlineWorks.map((w) => commons(w.fileName, 640)),
  ];

  return (
    <div
      className="bg-bg text-ink"
      style={
        {
          "--c-bg": p.bg,
          "--c-surface": p.surface,
          "--c-accent": p.accent,
          "--c-text": p.text,
          "--c-muted": p.muted,
        } as React.CSSProperties
      }
    >
      {/* HERO */}
      <section className="relative min-h-screen flex items-end md:items-center overflow-hidden pt-24">
        {heroWork && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={commons(heroWork.fileName, 1280)}
              alt=""
              fill
              className="object-cover blur-sm scale-105"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-b from-bg/60 via-bg/40 to-bg" />
          </div>
        )}

        <div className="relative z-10 grid md:grid-cols-[minmax(0,380px)_1fr] gap-10 items-center px-6 md:px-10 pb-16 md:pb-0 max-w-7xl mx-auto w-full">
          <FadeIn y={30} className="max-w-70 md:max-w-none mx-auto md:mx-0 w-full">
            <div data-speed="1.05" className="relative aspect-3/4 overflow-hidden rounded-lg shadow-2xl shadow-black/60 border border-white/10">
              <Image
                src={artist.portrait}
                alt={artist.nameMn}
                fill
                className="object-cover"
                priority
              />
            </div>
          </FadeIn>

          <div>
            <FadeIn y={20}>
              <p className="text-sm tracking-[0.35em] uppercase text-accent mb-4">
                {artist.movement} · {artist.nationality}
              </p>
            </FadeIn>
            <RevealText
              as="h1"
              immediate
              delay={0.15}
              className="font-serif-display text-5xl md:text-8xl leading-[1.05] text-ink"
            >
              {artist.nameMn}
            </RevealText>
            <FadeIn y={20} delay={0.6}>
              <p className="mt-4 text-xl text-muted font-serif-display italic">
                {artist.nameOriginal} · {artist.birthYear}–{artist.deathYear}
              </p>
            </FadeIn>
            <FadeIn y={20} delay={0.8}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/90">{artist.tagline}</p>
            </FadeIn>
            <FadeIn y={20} delay={1}>
              <div className="mt-8">
                <SaveOfflineButton
                  slug={slug}
                  artistName={artist.nameMn}
                  urls={offlineUrls}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* НАМТАР */}
      <section className="px-6 md:px-10 py-24 max-w-4xl mx-auto">
        <RevealText as="h2" className="font-serif-display text-3xl md:text-5xl mb-10 text-accent">
          Намтар
        </RevealText>
        {artist.bio.map((para, i) => (
          <FadeIn key={i} y={30}>
            <p className="text-lg leading-relaxed text-ink/85 mb-6 first-letter:font-serif-display first-letter:text-4xl first-letter:text-accent first-letter:mr-1 first-letter:float-left first-letter:leading-none">
              {para}
            </p>
          </FadeIn>
        ))}
      </section>

      {/* АМЬДРАЛЫН ОН ДАРААЛАЛ */}
      <section className="px-6 md:px-10 py-24 max-w-5xl mx-auto">
        <RevealText as="h2" className="font-serif-display text-3xl md:text-5xl mb-16 text-accent">
          Амьдралын он дараалал
        </RevealText>
        <Timeline events={artist.timeline} />
      </section>

      {/* ШИЛДЭГ БҮТЭЭЛҮҮД — зөвхөн монгол тайлбар бичсэн зураачдад */}
      {artist.notableWorks.length > 0 && (
      <section className="px-6 md:px-10 py-24 max-w-7xl mx-auto">
        <RevealText as="h2" className="font-serif-display text-3xl md:text-5xl mb-4 text-accent">
          Шилдэг бүтээлүүд
        </RevealText>
        <FadeIn y={20}>
          <p className="text-muted mb-16">Зураг дээр дарж дэлгэрэнгүй үзээрэй.</p>
        </FadeIn>

        <div className="space-y-24">
          {artist.notableWorks.map((work, i) => {
            const age = work.yearStart - artist.birthYear;
            return (
              <FadeIn key={work.id} y={50}>
                <Link
                  href={`/artists/${artist.slug}/artwork/${work.id}`}
                  className={`group grid md:grid-cols-2 gap-8 md:gap-14 items-center ${
                    i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="overflow-hidden rounded-lg bg-surface border border-white/5 shadow-xl shadow-black/40">
                    <Image
                      src={work.image}
                      alt={work.titleMn}
                      width={900}
                      height={Math.round(900 / work.aspect)}
                      className="w-full h-auto group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-accent font-serif-display text-2xl">{work.yearDisplay}</span>
                      {age > 0 && (
                        <span className="text-xs tracking-wider uppercase bg-accent/15 text-accent px-3 py-1 rounded-full">
                          {age} настайдаа
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif-display text-3xl md:text-4xl mt-3 text-ink group-hover:text-accent transition-colors">
                      {work.titleMn}
                    </h3>
                    <p className="text-muted italic mt-1">{work.title}</p>
                    <p className="mt-5 leading-relaxed text-ink/85">{work.description}</p>
                    <p className="mt-4 text-sm text-muted">
                      {work.medium} · {work.location}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>
      )}

      {/* БҮРЭН ЦУГЛУУЛГА */}
      {more.length > 0 && (
        <section className="px-6 md:px-10 py-24 max-w-7xl mx-auto">
          <RevealText as="h2" className="font-serif-display text-3xl md:text-5xl mb-4 text-accent">
            Бүрэн цуглуулга
          </RevealText>
          <FadeIn y={20}>
            <p className="text-muted mb-12">
              {artist.nameMn} нийт {allWorks.length.toLocaleString("mn-MN")} бүтээлтэй. Хамгийн
              алдартай нь эндээс.
            </p>
          </FadeIn>

          <FadeIn stagger=".artwork-card" className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {more.map((work) => (
              <ArtworkCard key={work.id} work={work} width={600} />
            ))}
          </FadeIn>

          <FadeIn y={20} className="mt-14 text-center">
            <Link
              href={`/artists/${artist.slug}/works`}
              className="inline-block border border-accent/60 text-accent px-8 py-3 label hover:bg-accent hover:text-bg transition-colors rounded-full"
            >
              Бүх {allWorks.length.toLocaleString("mn-MN")} бүтээлийг үзэх →
            </Link>
          </FadeIn>
        </section>
      )}

      {/* ДАРААГИЙН ЗУРААЧ */}
      <NextArtist current={artist.slug} />
    </div>
  );
}

function NextArtist({ current }: { current: string }) {
  const idx = artists.findIndex((a) => a.slug === current);
  const next = artists[(idx + 1) % artists.length];
  return (
    <section className="border-t border-white/10 px-6 md:px-10 py-16">
      <Link href={`/artists/${next.slug}`} className="group block max-w-7xl mx-auto">
        <p className="text-sm tracking-[0.3em] uppercase text-muted">Дараагийн зураач</p>
        <div className="flex items-center justify-between gap-6 mt-3">
          <h2 className="font-serif-display text-4xl md:text-6xl text-ink group-hover:text-accent transition-colors">
            {next.nameMn}
          </h2>
          <span className="text-4xl text-accent group-hover:translate-x-2 transition-transform">→</span>
        </div>
      </Link>
    </section>
  );
}
