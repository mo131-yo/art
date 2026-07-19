import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { artists, getArtist, getNotableWork } from "@/lib/artists";
import { getAicArtwork } from "@/lib/aic";
import FadeIn from "@/components/gsap/FadeIn";
import RevealText from "@/components/gsap/RevealText";

export function generateStaticParams() {
  return artists.flatMap((a) =>
    a.notableWorks.map((w) => ({ slug: a.slug, id: w.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const artist = getArtist(slug);
  if (!artist) return {};
  const work = getNotableWork(artist, id);
  return { title: work ? `${work.titleMn} — ${artist.nameMn}` : artist.nameMn };
}

type View = {
  title: string;
  subtitle: string | null;
  yearDisplay: string;
  age: number | null;
  medium: string;
  location: string;
  description: string | null;
  image: string;
  aspect: number;
};

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();

  let view: View | null = null;

  if (id.startsWith("aic-")) {
    const aicId = Number(id.slice(4));
    if (Number.isFinite(aicId)) {
      const work = await getAicArtwork(artist, aicId);
      if (work) {
        view = {
          title: work.title,
          subtitle: null,
          yearDisplay: work.yearDisplay,
          age: work.ageWhenPainted,
          medium: work.medium,
          location: `Чикагогийн урлагийн институт${work.dimensions ? ` · ${work.dimensions}` : ""}`,
          description: null,
          image: work.imageLarge,
          aspect: work.aspect,
        };
      }
    }
  } else {
    const work = getNotableWork(artist, id);
    if (work) {
      view = {
        title: work.titleMn,
        subtitle: work.title,
        yearDisplay: work.yearDisplay,
        age: work.yearStart - artist.birthYear,
        medium: work.medium,
        location: work.location,
        description: work.description,
        image: work.image,
        aspect: work.aspect,
      };
    }
  }

  if (!view) notFound();
  const p = artist.palette;

  return (
    <div
      className="bg-bg text-ink min-h-screen"
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
      <div className="px-6 md:px-10 pt-28 pb-24 max-w-7xl mx-auto">
        <FadeIn y={10}>
          <Link
            href={`/artists/${artist.slug}`}
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-muted hover:text-accent transition-colors"
          >
            ← {artist.nameMn}
          </Link>
        </FadeIn>

        <div
          className={`mt-10 grid gap-10 lg:gap-16 items-start ${
            view.aspect >= 1.15 ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]"
          }`}
        >
          <FadeIn y={40}>
            <div className="overflow-hidden rounded-lg bg-surface border border-white/10 shadow-2xl shadow-black/50">
              <Image
                src={view.image}
                alt={view.title}
                width={1200}
                height={Math.round(1200 / view.aspect)}
                className="w-full h-auto"
                priority
              />
            </div>
          </FadeIn>

          <div className={view.aspect >= 1.15 ? "max-w-3xl" : "lg:sticky lg:top-28"}>
            <FadeIn y={20} delay={0.15}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-accent font-serif-display text-2xl">{view.yearDisplay}</span>
                {view.age !== null && view.age > 0 && (
                  <span className="text-xs tracking-wider uppercase bg-accent/15 text-accent px-3 py-1 rounded-full">
                    {view.age} настайдаа зурсан
                  </span>
                )}
              </div>
            </FadeIn>

            <RevealText
              as="h1"
              immediate
              delay={0.25}
              className="font-serif-display text-4xl md:text-5xl mt-4 text-ink leading-tight"
            >
              {view.title}
            </RevealText>

            {view.subtitle && (
              <FadeIn y={15} delay={0.5}>
                <p className="text-muted italic text-lg mt-2">{view.subtitle}</p>
              </FadeIn>
            )}

            <FadeIn y={20} delay={0.6}>
              <div className="mt-6 space-y-1 text-sm text-muted border-l-2 border-accent/40 pl-4">
                <p>{view.medium}</p>
                <p>{view.location}</p>
                <p>
                  <Link href={`/artists/${artist.slug}`} className="hover:text-accent transition-colors">
                    {artist.nameMn} ({artist.birthYear}–{artist.deathYear})
                  </Link>
                </p>
              </div>
            </FadeIn>

            {view.description && (
              <FadeIn y={25} delay={0.7}>
                <p className="mt-8 text-lg leading-relaxed text-ink/90">{view.description}</p>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
