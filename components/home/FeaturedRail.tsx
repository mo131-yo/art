import Link from "next/link";
import Image from "next/image";
import { getShowcase } from "@/lib/artworks";
import { getArtist } from "@/lib/artists";
import { commons } from "@/lib/data/types";
import RevealText from "@/components/gsap/RevealText";

/**
 * Он цагийн дарааллаар зураач бүрийн хамгийн алдартай нэг бүтээл.
 * Хэвтээ гүйлт нь энгийн `overflow-x` — ScrollSmoother-той зөрчилдөхгүй,
 * гар утсанд шүргэлтээр гүйнэ.
 */
export default async function FeaturedRail() {
  const works = await getShowcase(20);

  return (
    <section className="py-24">
      <div className="px-6 md:px-10 max-w-[100rem] mx-auto">
        <RevealText as="h2" className="font-serif-display text-(length:--text-title) text-ink mb-3">
          Онцлох бүтээлүүд
        </RevealText>
        <p className="text-muted mb-10 max-w-2xl">
          Мастер бүрийн хамгийн алдартай нэг бүтээл — он цагийн дарааллаар.
        </p>
      </div>

      <div className="overflow-x-auto pb-6 [scrollbar-width:thin]">
        <div className="flex gap-6 px-6 md:px-10 w-max">
          {works.map((w) => {
            const artist = getArtist(w.slug);
            return (
              <Link
                key={`${w.slug}-${w.id}`}
                href={`/artists/${w.slug}/artwork/${w.id}`}
                className="group shrink-0 w-64"
              >
                <div className="relative h-80 overflow-hidden bg-raise">
                  <Image
                    src={commons(w.fileName, 640)}
                    alt={w.title}
                    fill
                    className="object-cover grayscale-[0.15] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                </div>
                <h3 className="font-serif-display text-lg mt-3 text-ink group-hover:text-accent transition-colors leading-tight">
                  {w.titleMn ?? w.title}
                </h3>
                <p className="label pt-1">
                  {artist?.nameMn}
                  {w.year ? ` · ${w.year}` : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
