"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import {
  buildHref, toggle, activeCount, SORT_LABELS,
  type Facets, type Filters, type SortKey,
} from "@/lib/filters";
import { genre, material, collection } from "@/lib/data/vocab-mn";

type ListKey = "genre" | "material" | "collection";

const TRANSLATORS: Record<ListKey, (k: string) => string> = {
  genre, material, collection,
};

const GROUP_LABELS: Record<ListKey, string> = {
  genre: "Жанр",
  material: "Материал",
  collection: "Музей",
};

type Props = {
  filters: Filters;
  facets: Facets;
  /** Шүүлтийн дараах үр дүнгийн тоо */
  total: number;
  /** Зураачийн шүүлтүүр харуулах эсэх (нэг зураачийн хуудсанд хэрэггүй) */
  artistOptions?: { slug: string; name: string }[];
};

/**
 * Бүх төлөв URL-д амьдарна — энэ компонент локал state барихгүй.
 * Ингэснээр линк хуваалцах, буцах товч, SEO бүгд өөрөө ажиллана.
 */
export default function FilterPills({ filters, facets, total, artistOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const go = (patch: Partial<Filters>) => {
    startTransition(() => {
      router.push(buildHref(pathname, filters, patch), { scroll: false });
    });
  };

  const active = activeCount(filters);

  const groups = (
    <>
      {artistOptions && artistOptions.length > 0 && (
        <PillRow label="Зураач">
          {artistOptions.map((a) => (
            <Pill
              key={a.slug}
              on={filters.artist.includes(a.slug)}
              onClick={() => go({ artist: toggle(filters.artist, a.slug) })}
            >
              {a.name}
            </Pill>
          ))}
        </PillRow>
      )}

      {(["genre", "material", "collection"] as ListKey[]).map((key) =>
        facets[key].length > 0 ? (
          <PillRow key={key} label={GROUP_LABELS[key]}>
            {facets[key].map((f) => (
              <Pill
                key={f.key}
                on={filters[key].includes(f.key)}
                onClick={() => go({ [key]: toggle(filters[key], f.key) })}
                count={f.count}
              >
                {TRANSLATORS[key](f.key)}
              </Pill>
            ))}
          </PillRow>
        ) : null,
      )}

      {facets.years && facets.years.min < facets.years.max && (
        <PillRow label="Он">
          <YearRange
            min={facets.years.min}
            max={facets.years.max}
            from={filters.from}
            to={filters.to}
            onChange={(from, to) => go({ from, to })}
          />
        </PillRow>
      )}
    </>
  );

  return (
    <div className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      {/* Хураангуй мөр — үргэлж харагдана */}
      <div className="flex items-center justify-between gap-4 border-y border-line py-4">
        <p className="label">
          {total.toLocaleString("mn-MN")} бүтээл
          {active > 0 && ` · ${active} шүүлтүүр`}
        </p>

        <div className="flex items-center gap-3">
          {active > 0 && (
            <button
              onClick={() =>
                go({ artist: [], genre: [], material: [], collection: [], from: null, to: null, featured: false })
              }
              className="label hover:text-accent transition-colors"
            >
              Цэвэрлэх ✕
            </button>
          )}

          <Pill on={filters.featured} onClick={() => go({ featured: !filters.featured })}>
            ◆ Онцлох
          </Pill>

          <select
            value={filters.sort}
            onChange={(e) => go({ sort: e.target.value as SortKey })}
            aria-label="Эрэмбэлэх"
            className="label bg-transparent border border-line rounded-full px-3 py-1.5 text-ink/80 hover:border-accent/50 transition-colors cursor-pointer"
          >
            {Object.entries(SORT_LABELS).map(([k, v]) => (
              <option key={k} value={k} className="bg-bg text-ink">
                {v}
              </option>
            ))}
          </select>

          {/* Гар утсанд бүх шүүлтүүр bottom sheet-д нуугдана */}
          <button
            onClick={() => setSheetOpen(true)}
            className="md:hidden label border border-line rounded-full px-4 py-1.5 text-ink/80"
          >
            Шүүлтүүр{active > 0 && ` (${active})`}
          </button>
        </div>
      </div>

      {/* Дэлгэц дээр — шууд харагдана */}
      <div className="hidden md:block space-y-4 py-6">{groups}</div>

      {/* Гар утсанд — доороос гарах хуудас */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <button
            aria-label="Хаах"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="relative bg-bg border-t border-line rounded-t-2xl max-h-[80vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between sticky -top-6 bg-bg py-2">
              <span className="label">Шүүлтүүр</span>
              <button onClick={() => setSheetOpen(false)} className="text-accent text-xl leading-none">
                ✕
              </button>
            </div>
            {groups}
            <button
              onClick={() => setSheetOpen(false)}
              className="w-full border border-accent/60 text-accent rounded-full py-3 label"
            >
              {total.toLocaleString("mn-MN")} бүтээл үзэх
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PillRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-baseline">
      <span className="label shrink-0 w-20 pt-1.5">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  on, onClick, count, children,
}: {
  on: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`text-sm rounded-full px-3.5 py-1.5 border transition-colors ${
        on
          ? "border-accent bg-accent text-bg"
          : "border-line text-ink/75 hover:border-accent/50 hover:text-ink"
      }`}
    >
      {children}
      {count !== undefined && <span className={`ml-1.5 text-xs ${on ? "opacity-70" : "text-muted"}`}>{count}</span>}
    </button>
  );
}

/** Аравтын алхамтай он сонголт — жил бүрээр гүйлгэх нь энэ хэмжээнд утгагүй */
function YearRange({
  min, max, from, to, onChange,
}: {
  min: number;
  max: number;
  from: number | null;
  to: number | null;
  onChange: (from: number | null, to: number | null) => void;
}) {
  const start = Math.floor(min / 10) * 10;
  const end = Math.ceil(max / 10) * 10;
  const decades: number[] = [];
  for (let d = start; d < end; d += 10) decades.push(d);

  // Аравт хэт олон бол зуунаар бүлэглэнэ
  if (decades.length > 16) {
    const centuries: number[] = [];
    for (let c = Math.floor(start / 100) * 100; c < end; c += 100) centuries.push(c);
    return (
      <>
        {centuries.map((c) => (
          <Pill key={c} on={from === c && to === c + 99} onClick={() => onChange(from === c ? null : c, from === c ? null : c + 99)}>
            {c / 100 + 1}-р зуун
          </Pill>
        ))}
      </>
    );
  }

  return (
    <>
      {decades.map((d) => (
        <Pill key={d} on={from === d && to === d + 9} onClick={() => onChange(from === d ? null : d, from === d ? null : d + 9)}>
          {d}-аад
        </Pill>
      ))}
    </>
  );
}
