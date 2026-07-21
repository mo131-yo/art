"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  toggleFavorite,
  favKey,
  type FavoriteWork,
} from "@/lib/favorites";

type Props = {
  work: Omit<FavoriteWork, "addedAt">;
  /** `card` — зургийн буланд хөвөх; `inline` — метадатын хажууд */
  variant?: "card" | "inline";
};

/**
 * Зүрхний товч. Төлөв нь `localStorage`-д байдаг тул нэвтрэх шаардлагагүй,
 * офлайнд ч ажиллана.
 */
export default function FavoriteButton({ work, variant = "card" }: Props) {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const key = favKey(work.slug, work.id);
  const active = favorites.some((w) => favKey(w.slug, w.id) === key);

  const label = active ? "Дуртайгаас хасах" : "Дуртайд нэмэх";

  const onClick = (e: React.MouseEvent) => {
    // Карт бүхэлдээ линк тул хуудас солигдохоос сэргийлнэ
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(work);
  };

  if (variant === "inline") {
    return (
      <button
        onClick={onClick}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 label transition-colors ${
          active
            ? "border-accent bg-accent text-bg"
            : "border-line text-ink/75 hover:border-accent/50 hover:text-ink"
        }`}
      >
        <span className="text-sm leading-none">{active ? "♥" : "♡"}</span>
        {active ? "Дуртай" : "Дуртайд нэмэх"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full text-lg leading-none transition-all ${
        active
          ? "bg-accent text-bg"
          : "bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-black/70 backdrop-blur-sm"
      }`}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}
