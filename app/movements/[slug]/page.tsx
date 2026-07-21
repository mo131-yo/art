import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { movements, getMovement, artistsOf } from "@/lib/movements";
import { getArtistWorks } from "@/lib/artworks";
import RevealText from "@/components/gsap/RevealText";
import FadeIn from "@/components/gsap/FadeIn";
import ArtworkCard from "@/components/browse/ArtworkCard";

export function generateStaticParams() {
  return movements.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getMovement(slug);
  return m ? { title: m.name, description: m.description } : {};
}

export default async function MovementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movement = getMovement(slug);
  if (!movement) notFound();

  const artists = artistsOf(slug);

  // Хөдөлгөөн бүрийн төлөөлөх бүтээлүүд: зураач тус бүрийн хамгийн алдартай нэг
  const highlights = await Promise.all(
    artists.map(async (a) => (await getArtistWorks(a.slug))[0]),
  );

  return (
    <div className="bg-bg text-ink min-h-screen">
      <div className="px-6 md:px-10 pt-32 pb-24 max-w-[100rem] mx-auto">
        <Link href="/movements" className="label hover:text-accent transition-colors">
          ← Бүх хөдөлгөөн
        </Link>

        <header className="mt-4 mb-16 max-w-3xl">
          <p className="label text-accent">{movement.period}</p>
          <RevealText
            as="h1"
            immediate
            className="font-serif-display text-(length:--text-title) leading-[1.05] mt-2"
          >
            {movement.name}
          </RevealText>
          <p className="mt-6 text-(length:--text-lede) leading-relaxed text-ink/85">
            {movement.description}
          </p>
        </header>

        <section>
          <h2 className="label border-b border-line pb-4 mb-8">Энэ урсгалын зураачид</h2>
          <div className="flex flex-wrap gap-3">
            {artists.map((a) => (
              <Link
                key={a.slug}
                href={`/artists/${a.slug}`}
                className="border border-line rounded-full px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors"
              >
                {a.nameMn}
                <span className="text-muted ml-2">{a.birthYear}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="label border-b border-line pb-4 mb-8">Төлөөлөх бүтээлүүд</h2>
          <div className="columns-2 md:columns-3 xl:columns-4 gap-6">
            {highlights.filter(Boolean).map((w) => (
              <FadeIn key={w!.id} y={20}>
                <ArtworkCard work={w!} width={500} artistName={undefined} />
              </FadeIn>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
