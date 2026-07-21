import type { Metadata } from "next";
import { artists } from "@/lib/artists";
import type { Artist } from "@/lib/data/types";
import RevealText from "@/components/gsap/RevealText";
import ArtistGrid from "@/components/ArtistGrid";

export const metadata: Metadata = {
  title: "Зураачид",
  description: "Сэргэн мандалтаас модернизм хүртэл — 50 их мастерыг үеээр нь.",
};

/** Зураачийг төрсөн оноор нь урлагийн үед хуваарилна */
const PERIODS = [
  { key: "renaissance", label: "Сэргэн мандалт", max: 1600 },
  { key: "baroque", label: "Барокко", max: 1700 },
  { key: "enlightenment", label: "Гэгээрэл ба Романтизм", max: 1810 },
  { key: "realism", label: "Реализм ба Импрессионизм", max: 1845 },
  { key: "modern", label: "Модернизм", max: 9999 },
];

function periodOf(a: Artist): string {
  return PERIODS.find((p) => a.birthYear < p.max)!.key;
}

export default function ArtistsPage() {
  return (
    <div className="bg-bg text-ink min-h-screen">
      <div className="px-6 md:px-10 pt-32 pb-24 max-w-[100rem] mx-auto">
        <header className="mb-8">
          <p className="label">Багц</p>
          <RevealText
            as="h1"
            immediate
            className="font-serif-display text-(length:--text-title) leading-[1.05] mt-3"
          >
            Зураачид
          </RevealText>
          <p className="mt-4 text-muted max-w-2xl text-(length:--text-lede) leading-relaxed">
            Сэргэн мандалтаас модернизм хүртэл дэлхийн урлагийн түүхийг бүтээсэн {artists.length}{" "}
            зураач. Үеээр нь шүүж, хүссэн зураачаа нээж үзээрэй.
          </p>
        </header>

        <ArtistGrid
          items={artists.map((a) => ({ artist: a, group: periodOf(a) }))}
          groups={PERIODS.map((p) => ({ key: p.key, label: p.label }))}
        />
      </div>
    </div>
  );
}
