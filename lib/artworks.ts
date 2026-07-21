import "server-only";
import { artists, getArtist } from "./artists";
import { fileNameFromCommonsUrl, type Artist, type Artwork } from "./data/types";

/** `scripts/harvest.ts`-ийн бичдэг бичлэгийн хэлбэр */
type GeneratedWork = {
  id: string;
  title: string;
  curatedId: string | null;
  year: number | null;
  age: number | null;
  genres: string[];
  materials: string[];
  collection: string | null;
  dimsCm: { h: number; w: number } | null;
  fileName: string;
  aspect: number;
  rank: number;
};

export type IndexData = {
  total: number;
  perArtist: Record<string, number>;
  genres: Record<string, number>;
  materials: Record<string, number>;
  collections: Record<string, number>;
  top: (GeneratedWork & { artist: string })[];
};

// ─────────────────────── Ачаалалт ───────────────────────

/**
 * Зураач бүрийн JSON тусдаа chunk болж, хэрэгтэй үедээ л ачаалагдана.
 * Статик import хийвэл бүх 26,000 бүтээл сервер bundle-д орох байсан.
 */
async function loadGenerated(slug: string): Promise<GeneratedWork[]> {
  try {
    return (await import(`./data/generated/${slug}.json`)).default as GeneratedWork[];
  } catch {
    return []; // харвест хийгээгүй зураач — гараар бичсэн бүтээлүүд нь харагдана
  }
}

// ─────────────────────── Нэгтгэл ───────────────────────

/**
 * Гараар бичсэн бүтээлийг `Artwork` болгоно. Wikidata-гаас таарсан бичлэг
 * байвал түүний бүтэцтэй метадатыг (жанр, материал, хэмжээ) хэвээр үлдээж,
 * зөвхөн монгол текстийг нь дээр нь тавина.
 */
function mergeCurated(artist: Artist, gen: GeneratedWork | null, workId: string): Artwork | null {
  const w = artist.notableWorks.find((n) => n.id === workId);
  if (!w) return null;

  return {
    id: w.id,
    wikidataId: gen ? gen.id.slice(3) : null,
    slug: artist.slug,
    title: w.title,
    titleMn: w.titleMn,
    featured: true,
    year: gen?.year ?? w.yearStart,
    age: gen?.age ?? w.yearStart - artist.birthYear,
    genres: gen?.genres ?? [],
    materials: gen?.materials ?? [],
    collection: gen?.collection ?? null,
    dimsCm: gen?.dimsCm ?? null,
    fileName: gen?.fileName ?? fileNameFromCommonsUrl(w.image),
    aspect: w.aspect,
    rank: gen?.rank ?? 0,
    description: w.description,
    location: w.location,
  };
}

function fromGenerated(slug: string, g: GeneratedWork): Artwork {
  return {
    id: g.id,
    wikidataId: g.id.slice(3),
    slug,
    title: g.title,
    titleMn: null,
    featured: false,
    year: g.year,
    age: g.age,
    genres: g.genres,
    materials: g.materials,
    collection: g.collection,
    dimsCm: g.dimsCm,
    fileName: g.fileName,
    aspect: g.aspect,
    rank: g.rank,
    description: null,
    location: null,
  };
}

/**
 * Зураачийн бүх бүтээл — онцлох нь эхэнд, дараа нь алдаршлаар.
 *
 * Дата нь өөрчлөгддөггүй статик JSON тул `use cache` хязгааргүй хугацаагаар
 * хадгална.
 */
export async function getArtistWorks(slug: string): Promise<Artwork[]> {
  "use cache";

  const artist = getArtist(slug);
  if (!artist) return [];

  const generated = await loadGenerated(slug);

  const featured: Artwork[] = [];
  const rest: Artwork[] = [];
  const matched = new Set<string>();

  for (const g of generated) {
    if (g.curatedId) {
      const merged = mergeCurated(artist, g, g.curatedId);
      if (merged) {
        matched.add(g.curatedId);
        featured.push(merged);
        continue;
      }
    }
    rest.push(fromGenerated(slug, g));
  }

  // Wikidata-д таараагүй онцлох бүтээлүүд (нэр нь өөр бичигдсэн эсвэл
  // тухайн бүтээл Wikidata дээр байхгүй) — гар өгөгдлөөс шууд үүсгэнэ
  for (const w of artist.notableWorks) {
    if (matched.has(w.id)) continue;
    const solo = mergeCurated(artist, null, w.id);
    if (solo) featured.push(solo);
  }

  featured.sort((a, b) => b.rank - a.rank || (a.year ?? 0) - (b.year ?? 0));
  return [...featured, ...rest];
}

export async function getArtwork(slug: string, id: string): Promise<Artwork | null> {
  const works = await getArtistWorks(slug);
  return works.find((w) => w.id === id) ?? null;
}

/** Фасетын тоолуур ба хамгийн алдартай 2,000 бүтээл (глобал ухалтад) */
export async function getIndex(): Promise<IndexData> {
  "use cache";
  try {
    return (await import("./data/generated/index.json")).default as unknown as IndexData;
  } catch {
    return { total: 0, perArtist: {}, genres: {}, materials: {}, collections: {}, top: [] };
  }
}

/** Глобал ухалтад ашиглах бүтээлүүд — бүх зураачийн хамгийн алдартай нь */
export async function getTopWorks(): Promise<Artwork[]> {
  "use cache";
  const index = await getIndex();
  return index.top.map((g) => fromGenerated(g.artist, g));
}

/** Тухайн зураачийн нийт бүтээлийн тоо (JSON бүхэлд нь ачаалахгүй) */
export async function countWorks(slug: string): Promise<number> {
  "use cache";
  const index = await getIndex();
  return index.perArtist[slug] ?? getArtist(slug)?.notableWorks.length ?? 0;
}

export async function totalWorks(): Promise<number> {
  "use cache";
  return (await getIndex()).total;
}

/** Он цагийн дарааллаар — зураач бүрийн хамгийн алдартай нэг бүтээл */
export async function getShowcase(limit = 24): Promise<Artwork[]> {
  "use cache";
  const index = await getIndex();
  const seen = new Set<string>();
  const out: Artwork[] = [];
  for (const g of index.top) {
    if (seen.has(g.artist)) continue;
    seen.add(g.artist);
    out.push(fromGenerated(g.artist, g));
    if (out.length >= limit) break;
  }
  return out;
}

/** ⌘K командын палитрын хайлтын индекс — зураач + топ бүтээл + хөдөлгөөн */
export async function getSearchDocs(): Promise<
  { href: string; label: string; sub: string; kind: string; hay: string }[]
> {
  "use cache";
  const index = await getIndex();
  const nameOf = new Map(artists.map((a) => [a.slug, a.nameMn]));

  const artistDocs = artists.map((a) => ({
    href: `/artists/${a.slug}`,
    label: a.nameMn,
    sub: `${a.nameOriginal} · ${a.birthYear}–${a.deathYear}`,
    kind: "Зураач",
    hay: `${a.nameMn} ${a.nameOriginal} ${a.movement} ${a.nationality}`.toLowerCase(),
  }));

  const workDocs = index.top.slice(0, 600).map((g) => ({
    href: `/artists/${g.artist}/artwork/${g.id}`,
    label: g.title,
    sub: `${nameOf.get(g.artist) ?? g.artist}${g.year ? ` · ${g.year}` : ""}`,
    kind: "Бүтээл",
    hay: `${g.title} ${nameOf.get(g.artist) ?? ""}`.toLowerCase(),
  }));

  return [...artistDocs, ...workDocs];
}

export { artists, getArtist };
