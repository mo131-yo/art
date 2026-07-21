"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Artist } from "@/lib/data/types";

type Group = { key: string; label: string };

/** Зураач + аль бүлэгт хамаарах нь. Функц биш урьдчилан бодсон түлхүүр
 *  дамжина — client компонентад функц дамжуулах боломжгүй. */
export type GridArtist = { artist: Artist; group: string };

/**
 * Зураачдын сүлжээ + үеийн pill шүүлтүүр. Энэ нь URL биш локал төлөв
 * ашиглана — нүүр/жагсаалтын хуудсан дахь хөнгөн шүүлт бөгөөд хуваалцах
 * шаардлагагүй (жинхэнэ ухалт нь /works дээр).
 */
export default function ArtistGrid({
  items,
  groups,
}: {
  items: GridArtist[];
  groups: Group[];
}) {
  const [active, setActive] = useState<string>("all");
  const shown = active === "all" ? items : items.filter((it) => it.group === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-y border-line py-4 mb-10">
        <Pill on={active === "all"} onClick={() => setActive("all")}>
          Бүгд <span className="text-muted ml-1">{items.length}</span>
        </Pill>
        {groups.map((g) => {
          const n = items.filter((it) => it.group === g.key).length;
          if (n === 0) return null;
          return (
            <Pill key={g.key} on={active === g.key} onClick={() => setActive(g.key)}>
              {g.label} <span className="text-muted ml-1">{n}</span>
            </Pill>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {shown.map(({ artist }) => (
          <Link
            key={artist.slug}
            href={`/artists/${artist.slug}`}
            className="group relative overflow-hidden rounded-lg bg-surface border border-white/5 hover:border-(--card-accent) transition-colors duration-500"
            style={{ "--card-accent": artist.palette.accent } as React.CSSProperties}
          >
            <div className="aspect-3/4 overflow-hidden">
              <Image
                src={artist.portrait}
                alt={artist.nameMn}
                width={450}
                height={600}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-5 pt-16">
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: artist.palette.accent }}>
                {artist.movement}
              </div>
              <h3 className="font-serif-display text-2xl text-white mt-1">{artist.nameMn}</h3>
              <div className="text-sm text-white/60 mt-1">
                {artist.birthYear}–{artist.deathYear} · {artist.nationality}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`text-sm rounded-full px-4 py-1.5 border transition-colors ${
        on ? "border-accent bg-accent text-bg" : "border-line text-ink/75 hover:border-accent/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
