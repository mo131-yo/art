import Image from "next/image";
import Link from "next/link";
import { commons, type Artwork } from "@/lib/data/types";
import { genre } from "@/lib/data/vocab-mn";

type Props = {
  work: Artwork;
  /** Зураачийн нэрийг гарчгийн доор харуулах (олон зураачийн сүлжээнд) */
  artistName?: string;
  /** Сүлжээний баганын өргөнд тохирсон зургийн өргөн */
  width?: number;
  priority?: boolean;
};

/**
 * Каталогийн логик: гарчиг үргэлж харагдана, hover дээр нуугдахгүй.
 * Зургийг бага зэрэг бүдгэрүүлж, hover дээр л бүрэн өнгөтэй болгоно.
 */
export default function ArtworkCard({ work, artistName, width = 640, priority }: Props) {
  const label = work.titleMn ?? work.title;
  const meta = [work.year, work.genres[0] && genre(work.genres[0])].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/artists/${work.slug}/artwork/${work.id}`}
      className="artwork-card group block break-inside-avoid mb-8"
    >
      <div className="relative overflow-hidden bg-raise">
        <Image
          src={commons(work.fileName, width)}
          alt={label}
          width={width}
          height={Math.round(width / (work.aspect || 1))}
          unoptimized
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="w-full h-auto grayscale-[0.15] group-hover:grayscale-0 group-hover:brightness-110 transition-[filter] duration-700"
        />
        {work.featured && (
          <span
            className="absolute top-3 left-3 text-accent text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
            title="Онцлох бүтээл"
            aria-label="Онцлох бүтээл"
          >
            ◆
          </span>
        )}
      </div>

      <figcaption className="pt-3">
        <h3 className="font-serif-display text-lg leading-tight text-ink group-hover:text-accent transition-colors">
          {label}
        </h3>
        {work.titleMn && <p className="text-sm text-muted italic leading-snug">{work.title}</p>}
        <p className="label pt-1">
          {artistName ? `${artistName}${meta ? " · " : ""}${meta}` : meta || "Он тодорхойгүй"}
        </p>
      </figcaption>
    </Link>
  );
}
