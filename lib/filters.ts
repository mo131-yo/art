import type { Artwork } from "./data/types";

/**
 * Шүүлтүүрийн бүх төлөв URL-д амьдарна — локал state байхгүй.
 * Ингэснээр линк хуваалцаж болно, сервер талд шүүгдэнэ, SEO зөв ажиллана.
 */
export type Filters = {
  artist: string[];
  genre: string[];
  material: string[];
  collection: string[];
  from: number | null;
  to: number | null;
  featured: boolean;
  sort: SortKey;
  page: number;
};

export type SortKey = "fame" | "old" | "new" | "az";

export const SORT_LABELS: Record<SortKey, string> = {
  fame: "Алдартайгаар",
  old: "Эртнээс",
  new: "Сүүлийнхээс",
  az: "Цагаан толгойгоор",
};

export const PAGE_SIZE = 60;

/** URL-д харагддаг түлхүүр → `Filters`-ийн олон утгат талбарууд */
const LIST_KEYS = ["artist", "genre", "material", "collection"] as const;

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function list(v: string | string[] | undefined): string[] {
  const s = first(v);
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

function num(v: string | string[] | undefined): number | null {
  const n = Number(first(v));
  return Number.isFinite(n) ? n : null;
}

export function parseFilters(params: RawParams): Filters {
  const sort = first(params.sort) as SortKey;
  return {
    artist: list(params.artist),
    genre: list(params.genre),
    material: list(params.material),
    collection: list(params.collection),
    from: num(params.from),
    to: num(params.to),
    featured: first(params.featured) === "1",
    sort: sort in SORT_LABELS ? sort : "fame",
    page: Math.max(1, num(params.page) ?? 1),
  };
}

/** `Filters`-ийг буцаан query string болгоно — үндсэн утгууд URL-д гарахгүй */
export function toQuery(f: Filters): string {
  const q = new URLSearchParams();
  for (const k of LIST_KEYS) if (f[k].length) q.set(k, f[k].join(","));
  if (f.from !== null) q.set("from", String(f.from));
  if (f.to !== null) q.set("to", String(f.to));
  if (f.featured) q.set("featured", "1");
  if (f.sort !== "fame") q.set("sort", f.sort);
  if (f.page > 1) q.set("page", String(f.page));
  return q.toString();
}

/**
 * Одоогийн шүүлтүүр дээр өөрчлөлт хийж шинэ href үүсгэнэ.
 * Хуудасны дугаарыг автоматаар 1 болгож буцаана — өөр шүүлтүүр сонгоод
 * 7-р хуудсанд үлдэх нь хоосон дэлгэц харуулна.
 */
export function buildHref(pathname: string, current: Filters, patch: Partial<Filters>): string {
  const next: Filters = { ...current, ...patch, page: patch.page ?? 1 };
  const q = toQuery(next);
  return q ? `${pathname}?${q}` : pathname;
}

/** Олон утгат шүүлтүүрт нэг утгыг нэмэх/хасах */
export function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export function activeCount(f: Filters): number {
  return (
    LIST_KEYS.reduce((n, k) => n + f[k].length, 0) +
    (f.from !== null || f.to !== null ? 1 : 0) +
    (f.featured ? 1 : 0)
  );
}

export const isEmpty = (f: Filters) => activeCount(f) === 0;

// ─────────────────────── Шүүх ───────────────────────

const hasAny = (values: string[], wanted: string[]) =>
  wanted.length === 0 || values.some((v) => wanted.includes(v));

export function filterWorks(works: Artwork[], f: Filters): Artwork[] {
  const out = works.filter((w) => {
    if (f.featured && !w.featured) return false;
    if (f.artist.length && !f.artist.includes(w.slug)) return false;
    if (!hasAny(w.genres, f.genre)) return false;
    if (!hasAny(w.materials, f.material)) return false;
    if (f.collection.length && (!w.collection || !f.collection.includes(w.collection))) return false;
    if (f.from !== null && (w.year === null || w.year < f.from)) return false;
    if (f.to !== null && (w.year === null || w.year > f.to)) return false;
    return true;
  });

  switch (f.sort) {
    case "old":
      return out.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
    case "new":
      return out.sort((a, b) => (b.year ?? -9999) - (a.year ?? -9999));
    case "az":
      return out.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return out.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rank - a.rank);
  }
}

export type Facet = { key: string; count: number };
export type Facets = {
  genre: Facet[];
  material: Facet[];
  collection: Facet[];
  years: { min: number; max: number } | null;
};

/**
 * Одоогийн үр дүн дээрх фасетын тоолуур.
 *
 * Тоолохдоо тухайн фасет ӨӨРӨӨ шүүлтэнд оролцоогүй байх ёстой — эс бөгөөс
 * «Ландшафт» сонгосны дараа бусад бүх жанр 0 болж, өөр сонголт хийх
 * боломжгүй болно.
 */
export function getFacets(works: Artwork[], f: Filters, limit = 14): Facets {
  const count = (
    key: "genre" | "material" | "collection",
    pick: (w: Artwork) => string[]
  ): Facet[] => {
    const subset = filterWorks(works, { ...f, [key]: [] });
    const tally = new Map<string, number>();
    for (const w of subset) {
      for (const v of pick(w)) tally.set(v, (tally.get(v) ?? 0) + 1);
    }
    return [...tally]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
      .slice(0, limit);
  };

  const years = filterWorks(works, { ...f, from: null, to: null })
    .map((w) => w.year)
    .filter((y): y is number => y !== null);

  return {
    genre: count("genre", (w) => w.genres),
    material: count("material", (w) => w.materials),
    collection: count("collection", (w) => (w.collection ? [w.collection] : [])),
    years: years.length ? { min: Math.min(...years), max: Math.max(...years) } : null,
  };
}

export function paginate<T>(items: T[], page: number): { items: T[]; pages: number } {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const p = Math.min(page, pages);
  return { items: items.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE), pages };
}
