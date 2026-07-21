import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { artists, getArtist } from "@/lib/artists";
import { getArtistWorks } from "@/lib/artworks";
import BrowseResults from "@/components/browse/BrowseResults";
import WorksGridSkeleton from "@/components/browse/WorksGridSkeleton";
import RevealText from "@/components/gsap/RevealText";

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
    title: `${artist.nameMn} — бүх бүтээл`,
    description: `${artist.nameMn}-ийн бүтээлүүдийг жанр, материал, он цагаар нь ухаж үзээрэй.`,
  };
}

export default async function ArtistWorksPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();

  const works = await getArtistWorks(slug);
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
      <div className="px-6 md:px-10 pt-32 pb-24 max-w-[110rem] mx-auto">
        <header className="mb-8">
          <Link href={`/artists/${slug}`} className="label hover:text-accent transition-colors">
            ← {artist.nameMn}
          </Link>
          <RevealText
            as="h1"
            immediate
            className="font-serif-display text-(length:--text-title) leading-[1.05] mt-4"
          >
            Бүх бүтээл
          </RevealText>
          <p className="mt-3 text-muted max-w-2xl text-(length:--text-lede) leading-relaxed">
            {artist.nameOriginal} · {artist.birthYear}–{artist.deathYear}. Жанр, материал, музей,
            он цагаар нь шүүж үзээрэй. ◆ тэмдэгтэй бүтээлүүд монгол тайлбартай.
          </p>
        </header>

        {/* searchParams уншдаг тул Suspense заавал */}
        <Suspense fallback={<WorksGridSkeleton />}>
          <BrowseResults
            works={works}
            searchParams={searchParams}
            pathname={`/artists/${slug}/works`}
          />
        </Suspense>
      </div>
    </div>
  );
}
