"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { commons } from "@/lib/data/types";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  removeFavorite,
  clearFavorites,
  favKey,
} from "@/lib/favorites";

/**
 * Дуртай бүтээлүүд бүхэлдээ `localStorage`-аас уншигдана — сервер рүү нэг ч
 * хүсэлт явуулахгүй тул офлайнд бүрэн ажиллана.
 */
export default function FavoritesGrid() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (favorites.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-5xl text-muted/40">♡</p>
        <p className="mt-6 text-muted max-w-md mx-auto leading-relaxed">
          Дуртай бүтээл алга байна. Бүтээлийн зураг дээр гарч ирэх зүрхний
          товчийг дарж энд хадгална уу — офлайнд ч харагдана.
        </p>
        <Link
          href="/works"
          className="inline-block mt-8 border border-accent/60 text-accent px-6 py-3 label hover:bg-accent hover:text-bg transition-colors rounded-full"
        >
          Бүтээл үзэх
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between border-y border-line py-4 mb-8">
        <p className="label">{favorites.length.toLocaleString("mn-MN")} бүтээл</p>
        <button
          onClick={() => {
            if (confirm("Бүх дуртай бүтээлийг устгах уу?")) clearFavorites();
          }}
          className="label hover:text-accent transition-colors"
        >
          Бүгдийг цэвэрлэх ✕
        </button>
      </div>

      <div className="columns-2 md:columns-3 xl:columns-4 gap-6">
        {favorites.map((w) => {
          const label = w.titleMn ?? w.title;
          return (
            <div key={favKey(w.slug, w.id)} className="group break-inside-avoid mb-8">
              <Link href={`/artists/${w.slug}/artwork/${w.id}`} className="block">
                <div className="relative overflow-hidden bg-raise">
                  <Image
                    src={commons(w.fileName, 640)}
                    alt={label}
                    width={640}
                    height={Math.round(640 / (w.aspect || 1))}
                    loading="lazy"
                    className="w-full h-auto grayscale-[0.15] group-hover:grayscale-0 transition-[filter] duration-700"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(w.slug, w.id);
                    }}
                    aria-label="Дуртайгаас хасах"
                    title="Дуртайгаас хасах"
                    className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full bg-accent text-bg text-lg leading-none"
                  >
                    ♥
                  </button>
                </div>
                <figcaption className="pt-3">
                  <h3 className="font-serif-display text-lg leading-tight text-ink group-hover:text-accent transition-colors">
                    {label}
                  </h3>
                  {w.titleMn && (
                    <p className="text-sm text-muted italic leading-snug">{w.title}</p>
                  )}
                  <p className="label pt-1">
                    {w.artistName}
                    {w.year ? ` · ${w.year}` : ""}
                  </p>
                </figcaption>
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
