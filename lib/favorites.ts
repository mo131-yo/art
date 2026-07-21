/**
 * Дуртай бүтээлүүд — `localStorage`-д хадгална.
 *
 * ID биш БҮТЭН метадатыг хадгалдаг: `/favorites` хуудас офлайнд ажиллах ёстой
 * тул серверээс дахин татах боломжгүй. Нэг бичлэг ~200 байт тул 5MB хязгаарт
 * олон мянган бүтээл багтана. (IndexedDB хэрэглэх шаардлагагүй — шинэ
 * dependency нэмэхээс зайлсхийв.)
 */

const KEY = "art-favorites";

export type FavoriteWork = {
  id: string;
  slug: string;
  /** Зураачийн монгол нэр — офлайнд харуулахад хэрэгтэй */
  artistName: string;
  title: string;
  titleMn: string | null;
  fileName: string;
  aspect: number;
  year: number | null;
  /** Хэзээ нэмсэн — шинээр нэмэгдсэн нь эхэнд харагдана */
  addedAt: number;
};

/** Нэг бүтээлийг өвөрмөцөөр тодорхойлно (id нь зураач хооронд давхардаж болно) */
export const favKey = (slug: string, id: string) => `${slug}/${id}`;

function read(): FavoriteWork[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FavoriteWork[]) : [];
  } catch {
    // Эвдэрсэн эсвэл гар аргаар өөрчлөгдсөн — хоосон гэж үзнэ
    return [];
  }
}

function write(list: FavoriteWork[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Хадгалах зай дүүрсэн — чимээгүй өнгөрнө
  }
  emit();
}

// ── Захиалагчид (React-ийн useSyncExternalStore-д зориулав) ──

const listeners = new Set<() => void>();

/** Хормын төлөв — `useSyncExternalStore` ижил обьект буцаахыг шаарддаг */
let snapshot: FavoriteWork[] | null = null;

function emit() {
  snapshot = null;
  for (const fn of listeners) fn();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  // Өөр таб дээр хийсэн өөрчлөлтийг барина
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): FavoriteWork[] {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

/** Сервер талд render хийхэд хоосон — тогтмол обьект байх ёстой */
const EMPTY: FavoriteWork[] = [];
export const getServerSnapshot = (): FavoriteWork[] => EMPTY;

// ── Үйлдлүүд ──

export function toggleFavorite(work: Omit<FavoriteWork, "addedAt">): boolean {
  const list = read();
  const key = favKey(work.slug, work.id);
  const existing = list.findIndex((w) => favKey(w.slug, w.id) === key);

  if (existing >= 0) {
    list.splice(existing, 1);
    write(list);
    return false;
  }

  list.unshift({ ...work, addedAt: Date.now() });
  write(list);
  return true;
}

export function removeFavorite(slug: string, id: string) {
  const key = favKey(slug, id);
  write(read().filter((w) => favKey(w.slug, w.id) !== key));
}

export function clearFavorites() {
  write([]);
}
