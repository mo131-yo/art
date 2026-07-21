export type Palette = {
  /** Хуудасны үндсэн фон */
  bg: string;
  /** Карт, хэсгүүдийн фон */
  surface: string;
  /** Онцлох өнгө (гарчиг, товч, шугам) */
  accent: string;
  /** Үндсэн текстийн өнгө */
  text: string;
  /** Бүдэг текстийн өнгө */
  muted: string;
};

export type TimelineEvent = {
  year: number;
  /** Тухайн үед хэдэн настай байсан */
  age: number;
  title: string;
  description: string;
};

export type NotableWork = {
  /** URL-д ашиглагдах ID */
  id: string;
  /** Эх хэлээрх / олон улсын нэр */
  title: string;
  titleMn: string;
  /** Дэлгэцэд харуулах он, ж: "1503–1519" */
  yearDisplay: string;
  /** Нас тооцоход ашиглах эхэлсэн он */
  yearStart: number;
  medium: string;
  location: string;
  /** Монгол тайлбар */
  description: string;
  /** Wikimedia Commons Special:FilePath URL */
  image: string;
  /** Зургийн харьцаа (өргөн / өндөр) — layout-д ашиглана */
  aspect: number;
};

/**
 * Сайт даяар ашиглагдах нэгдсэн бүтээлийн төрөл.
 *
 * Хоёр эх сурвалжийг нэгтгэнэ: Wikidata-аас харвест хийсэн бүтээлүүд ба
 * гараар бичсэн онцлох бүтээлүүд. Нэрээр нь таарсан тохиолдолд нэг бичлэг
 * болж, монгол нэр/тайлбар нь Wikidata-гийн бүтэцтэй метадатан дээр нэмэгдэнэ.
 */
export type Artwork = {
  /** URL-д ашиглах ID: "starry-night" (онцлох) эсвэл "wd-Q45585" */
  id: string;
  /** Wikidata-гийн QID — эх сурвалжийн холбоос гаргахад (байхгүй ч болно) */
  wikidataId: string | null;
  slug: string;
  /** Эх хэлээрх нэр */
  title: string;
  /** Монгол нэр — зөвхөн онцлох бүтээлд */
  titleMn: string | null;
  featured: boolean;
  year: number | null;
  /** Зурах үед зураач хэдэн настай байсан */
  age: number | null;
  /** Англи түлхүүр, ж: "landscape painting" — `genreMn`-ээр орчуулна */
  genres: string[];
  materials: string[];
  collection: string | null;
  dimsCm: { h: number; w: number } | null;
  /** Wikimedia Commons файлын нэр — `commons(fileName, width)`-д дамжуулна */
  fileName: string;
  aspect: number;
  /** Алдаршлын хэмжүүр (Wikipedia-гийн хэл хоорондын холбоосын тоо) */
  rank: number;
  /** Монгол тайлбар — зөвхөн онцлох бүтээлд */
  description: string | null;
  /** Хадгалагдаж буй газар монголоор — зөвхөн онцлох бүтээлд */
  location: string | null;
};

export type Artist = {
  slug: string;
  nameMn: string;
  nameOriginal: string;
  birthYear: number;
  deathYear: number;
  nationality: string;
  movement: string;
  /** Нэг өгүүлбэрт багтаах товч тодорхойлолт */
  tagline: string;
  /** Намтар — догол мөр бүрээр */
  bio: string[];
  timeline: TimelineEvent[];
  palette: Palette;
  /** Хөргийн зураг (Wikimedia Commons) */
  portrait: string;
  notableWorks: NotableWork[];
};

/** Wikimedia Commons файлын нэрээс URL үүсгэнэ */
export function commons(fileName: string, width = 1200): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    fileName,
  )}?width=${width}`;
}

/** `commons()`-оор үүсгэсэн URL-аас файлын нэрийг буцаан гаргана */
export function fileNameFromCommonsUrl(url: string): string {
  const m = url.match(/Special:FilePath\/([^?]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}
