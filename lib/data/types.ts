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
  /** AIC API-гийн artist_title дотор агуулагдах хэсэг (байхгүй бол null) */
  aicMatch: string | null;
  /** AIC хайлтын түлхүүр үг */
  aicQuery: string | null;
  notableWorks: NotableWork[];
};

/** Wikimedia Commons файлын нэрээс URL үүсгэнэ */
export function commons(fileName: string, width = 1200): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    fileName,
  )}?width=${width}`;
}

/** AIC IIIF image_id-аас зургийн URL үүсгэнэ (хамгийн том нийтийн хэмжээ нь 843px) */
export function aicImage(imageId: string, width = 843): string {
  return `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`;
}
