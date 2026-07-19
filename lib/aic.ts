import "server-only";
import { Artist } from "./artists";
import { aicImage } from "./data/types";

/**
 * Art Institute of Chicago (AIC) нээлттэй API-гийн server-side давхарга.
 * Зөвхөн Server Component-оос дуудагдана — browser-т API хүсэлт харагдахгүй.
 * https://api.artic.edu/docs/
 */

const AIC_SEARCH = "https://api.artic.edu/api/v1/artworks/search";

const FIELDS = [
  "id",
  "title",
  "artist_title",
  "date_start",
  "date_display",
  "medium_display",
  "dimensions",
  "image_id",
  "is_public_domain",
  "thumbnail",
].join(",");

type AicApiArtwork = {
  id: number;
  title: string;
  artist_title: string | null;
  date_start: number | null;
  date_display: string | null;
  medium_display: string | null;
  dimensions: string | null;
  image_id: string | null;
  is_public_domain: boolean;
  thumbnail: { width: number; height: number } | null;
};

export type AicArtwork = {
  id: number;
  title: string;
  yearDisplay: string;
  /** Зурах үед зураач хэдэн настай байсан (тооцоолох боломжгүй бол null) */
  ageWhenPainted: number | null;
  medium: string;
  dimensions: string;
  image: string;
  imageLarge: string;
  aspect: number;
};

/** Тухайн зураачийн бүтээлүүдийг AIC-ээс хайж, зөвхөн зурагтай, нийтийн өмчийнхийг буцаана */
export async function getAicArtworks(artist: Artist, limit = 12): Promise<AicArtwork[]> {
  "use cache";

  if (!artist.aicQuery || !artist.aicMatch) return [];

  const url = `${AIC_SEARCH}?q=${encodeURIComponent(artist.aicQuery)}&fields=${FIELDS}&limit=40`;

  let data: { data?: AicApiArtwork[] };
  try {
    const res = await fetch(url, {
      headers: { "AIC-User-Agent": "art-gallery-mn (student project)" },
    });
    if (!res.ok) return [];
    data = await res.json();
  } catch {
    // API унтарсан үед сайт notableWorks-оороо хэвийн ажиллана
    return [];
  }

  const notableTitles = new Set(artist.notableWorks.map((w) => w.title.toLowerCase()));

  return (data.data ?? [])
    .filter(
      (a) =>
        a.image_id &&
        a.is_public_domain &&
        a.artist_title?.includes(artist.aicMatch!) &&
        // Гараар оруулсан алдартай бүтээлүүдийг давхардуулахгүй
        !notableTitles.has(a.title.toLowerCase()),
    )
    .slice(0, limit)
    .map((a) => ({
      id: a.id,
      title: a.title,
      yearDisplay: a.date_display ?? "",
      ageWhenPainted:
        a.date_start && a.date_start > artist.birthYear
          ? a.date_start - artist.birthYear
          : null,
      medium: a.medium_display ?? "",
      dimensions: a.dimensions?.split(";")[0] ?? "",
      image: aicImage(a.image_id!, 600),
      imageLarge: aicImage(a.image_id!, 843),
      aspect:
        a.thumbnail?.width && a.thumbnail?.height
          ? a.thumbnail.width / a.thumbnail.height
          : 1,
    }));
}

/** Нэг бүтээлийг ID-аар нь авна (зургийн дэлгэрэнгүй хуудсанд) */
export async function getAicArtwork(artist: Artist, artworkId: number): Promise<AicArtwork | null> {
  const works = await getAicArtworks(artist);
  return works.find((w) => w.id === artworkId) ?? null;
}
