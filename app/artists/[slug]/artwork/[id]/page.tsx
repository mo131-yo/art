import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { artists, getArtist } from "@/lib/artists";
import { getArtistWorks, getArtwork } from "@/lib/artworks";
import { commons, type Artwork } from "@/lib/data/types";
import { genre, material, collection } from "@/lib/data/vocab-mn";
import { toQuery, parseFilters } from "@/lib/filters";
import FadeIn from "@/components/gsap/FadeIn";
import RevealText from "@/components/gsap/RevealText";
import ArtworkZoom from "@/components/ArtworkZoom";
import ArtworkCard from "@/components/browse/ArtworkCard";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import ShareButton from "@/components/ShareButton";

/**
 * Бүх 26,000 бүтээлийг prerender хийвэл build хэдэн арван минут болно.
 * Зураач тус бүрийн хамгийн алдартай 20-г урьдчилан үүсгээд, үлдсэнийг нь
 * эхний зочилтод үүсгүүлнэ (`dynamicParams` анхдагчаараа асаалттай).
 */
export async function generateStaticParams() {
  const params: { slug: string; id: string }[] = [];
  for (const a of artists) {
    const works = await getArtistWorks(a.slug);
    for (const w of works.slice(0, 20)) params.push({ slug: a.slug, id: w.id });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const artist = getArtist(slug);
  if (!artist) return {};
  const work = await getArtwork(slug, id);
  if (!work) return { title: artist.nameMn };
  return {
    title: `${work.titleMn ?? work.title} — ${artist.nameMn}`,
    description: work.description ?? `${artist.nameMn}-ийн бүтээл${work.year ? `, ${work.year}` : ""}.`,
  };
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();

  const all = await getArtistWorks(slug);
  const work = all.find((w) => w.id === id);
  if (!work) notFound();

  const p = artist.palette;
  const title = work.titleMn ?? work.title;

  // Ижил жанрын болон ойролцоо онд зурсан бүтээлүүд
  const sameGenre = work.genres.length
    ? all.filter((w) => w.id !== work.id && w.genres.some((g) => work.genres.includes(g))).slice(0, 6)
    : [];
  const sameTime = work.year
    ? all
        .filter((w) => w.id !== work.id && w.year !== null && Math.abs(w.year - work.year!) <= 2)
        .slice(0, 6)
    : [];

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
      <div className="px-6 md:px-10 pt-28 pb-24 max-w-[100rem] mx-auto">
        <FadeIn y={10}>
          <Link href={`/artists/${slug}`} className="label hover:text-accent transition-colors">
            ← {artist.nameMn}
          </Link>
        </FadeIn>

        <div className="mt-10 grid gap-12 lg:gap-16 items-start lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* ЗУРАГ */}
          <FadeIn y={40}>
            <ArtworkZoom src={commons(work.fileName, 1920)} alt={title}>
              <Image
                src={commons(work.fileName, 1280)}
                alt={title}
                width={1280}
                height={Math.round(1280 / (work.aspect || 1))}
                priority
                className="w-full h-auto max-h-[85vh] object-contain bg-raise"
              />
            </ArtworkZoom>
            <p className="label pt-3 text-center">Зураг дээр дарж томруулна</p>
          </FadeIn>

          {/* МЕТАДАТА */}
          <div className="lg:sticky lg:top-28">
            <FadeIn y={20} delay={0.15}>
              <p className="label">{work.featured ? "◆ Онцлох бүтээл" : "Бүтээл"}</p>
            </FadeIn>

            <RevealText
              as="h1"
              immediate
              delay={0.25}
              className="font-serif-display text-4xl md:text-5xl mt-3 leading-tight"
            >
              {title}
            </RevealText>

            {work.titleMn && (
              <FadeIn y={15} delay={0.5}>
                <p className="text-muted italic text-lg mt-2">{work.title}</p>
              </FadeIn>
            )}

            <FadeIn y={15} delay={0.55}>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <FavoriteButton
                  variant="inline"
                  work={{
                    id: work.id,
                    slug,
                    artistName: artist.nameMn,
                    title: work.title,
                    titleMn: work.titleMn,
                    fileName: work.fileName,
                    aspect: work.aspect,
                    year: work.year,
                  }}
                />
                <ShareButton
                  title={`${title} — ${artist.nameMn}`}
                  text={`${artist.nameMn}-ийн бүтээл${work.year ? `, ${work.year}` : ""}`}
                />
              </div>
            </FadeIn>

            <FadeIn y={20} delay={0.6}>
              <dl className="mt-8 border-t border-line">
                <Row label="Зураач">
                  <Link href={`/artists/${slug}`} className="hover:text-accent transition-colors">
                    {artist.nameMn}
                  </Link>
                </Row>
                {work.year !== null && <Row label="Он">{work.year}</Row>}
                {work.age !== null && work.age > 0 && (
                  <Row label="Зураачийн нас">{work.age} настайдаа</Row>
                )}
                {work.genres.length > 0 && (
                  <Row label="Жанр">
                    <Facets slug={slug} kind="genre" values={work.genres} translate={genre} />
                  </Row>
                )}
                {work.materials.length > 0 && (
                  <Row label="Материал">
                    <Facets slug={slug} kind="material" values={work.materials} translate={material} />
                  </Row>
                )}
                {work.dimsCm && (
                  <Row label="Хэмжээ">
                    {work.dimsCm.h} × {work.dimsCm.w} см
                  </Row>
                )}
                {(work.location || work.collection) && (
                  <Row label="Хадгалагдах газар">
                    {work.location ?? (
                      <Facets
                        slug={slug}
                        kind="collection"
                        values={[work.collection!]}
                        translate={collection}
                      />
                    )}
                  </Row>
                )}
              </dl>
            </FadeIn>

            {work.description && (
              <FadeIn y={25} delay={0.7}>
                <p className="mt-8 leading-relaxed text-ink/90">{work.description}</p>
              </FadeIn>
            )}

            <FadeIn y={15} delay={0.8}>
              <p className="label pt-8">
                Эх сурвалж:{" "}
                {work.wikidataId ? (
                  <a
                    href={`https://www.wikidata.org/wiki/${work.wikidataId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors underline underline-offset-4"
                  >
                    Wikidata
                  </a>
                ) : (
                  "Wikimedia Commons"
                )}
              </p>
            </FadeIn>
          </div>
        </div>

        <Rail title="Ижил төсөлтэй бүтээлүүд" works={sameGenre} />
        <Rail
          title={work.year ? `${work.year} оны орчимд зурсан` : "Мөн онд зурсан"}
          works={sameTime}
        />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4 py-3 border-b border-line">
      <dt className="label pt-0.5">{label}</dt>
      <dd className="text-sm text-ink/85">{children}</dd>
    </div>
  );
}

/** Метадатын утга бүр тухайн фасетаар шүүсэн жагсаалт руу очих линк */
function Facets({
  slug, kind, values, translate,
}: {
  slug: string;
  kind: "genre" | "material" | "collection";
  values: string[];
  translate: (k: string) => string;
}) {
  const base = parseFilters({});
  return (
    <span className="flex flex-wrap gap-x-2 gap-y-1">
      {values.map((v, i) => (
        <span key={v}>
          <Link
            href={`/artists/${slug}/works?${toQuery({ ...base, [kind]: [v] })}`}
            className="hover:text-accent transition-colors underline underline-offset-4 decoration-line"
          >
            {translate(v)}
          </Link>
          {i < values.length - 1 && <span className="text-muted">,</span>}
        </span>
      ))}
    </span>
  );
}

function Rail({ title, works }: { title: string; works: Artwork[] }) {
  if (works.length === 0) return null;
  return (
    <section className="pt-24">
      <h2 className="font-serif-display text-2xl md:text-3xl text-accent border-b border-line pb-4 mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {works.map((w) => (
          <ArtworkCard key={w.id} work={w} width={400} />
        ))}
      </div>
    </section>
  );
}
