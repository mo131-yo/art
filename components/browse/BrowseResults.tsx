import type { Artwork } from "@/lib/data/types";
import { parseFilters, filterWorks, getFacets, paginate } from "@/lib/filters";
import FilterPills from "./FilterPills";
import WorksGrid from "./WorksGrid";
import ArtworkCard from "./ArtworkCard";
import Pagination from "./Pagination";

type Props = {
  works: Artwork[];
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  pathname: string;
  /** Зураачийн шүүлтүүр — глобал ухалтад л хэрэгтэй */
  artistOptions?: { slug: string; name: string }[];
  /** slug → монгол нэр, картан дээр бичихэд */
  artistNames?: Record<string, string>;
};

/**
 * `searchParams` уншдаг тул энэ компонентыг ЗААВАЛ <Suspense> дотор
 * дуудна — `cacheComponents: true` үед өөрөөр build алдаа өгнө.
 */
export default async function BrowseResults({
  works, searchParams, pathname, artistOptions, artistNames,
}: Props) {
  const filters = parseFilters(await searchParams);
  const facets = getFacets(works, filters);
  const matched = filterWorks(works, filters);
  const { items, pages } = paginate(matched, filters.page);

  return (
    <>
      <FilterPills
        filters={filters}
        facets={facets}
        total={matched.length}
        artistOptions={artistOptions}
      />

      {items.length === 0 ? (
        <p className="py-24 text-center text-muted">
          Энэ шүүлтүүрт тохирох бүтээл олдсонгүй. Цөөн нөхцөл сонгож үзээрэй.
        </p>
      ) : (
        <WorksGrid count={items.length}>
          {items.map((w, i) => (
            <ArtworkCard
              key={`${w.slug}-${w.id}`}
              work={w}
              artistName={artistNames?.[w.slug]}
              priority={i < 4}
            />
          ))}
        </WorksGrid>
      )}

      <Pagination pathname={pathname} filters={filters} pages={pages} />
    </>
  );
}
