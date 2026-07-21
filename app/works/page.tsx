import { Suspense } from "react";
import type { Metadata } from "next";
import { artists } from "@/lib/artists";
import { getTopWorks, totalWorks } from "@/lib/artworks";
import BrowseResults from "@/components/browse/BrowseResults";
import WorksGridSkeleton from "@/components/browse/WorksGridSkeleton";
import RevealText from "@/components/gsap/RevealText";

export const metadata: Metadata = {
  title: "Бүтээлүүд",
  description:
    "50 их мастерын хамгийн алдартай бүтээлүүдийг зураач, жанр, материал, он цагаар нь ухаж үзээрэй.",
};

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const works = await getTopWorks();
  const total = await totalWorks();

  const artistOptions = artists.map((a) => ({ slug: a.slug, name: a.nameMn }));
  const artistNames = Object.fromEntries(artists.map((a) => [a.slug, a.nameMn]));

  return (
    <div className="bg-bg text-ink min-h-screen">
      <div className="px-6 md:px-10 pt-32 pb-24 max-w-[110rem] mx-auto">
        <header className="mb-8">
          <p className="label">Цуглуулга</p>
          <RevealText
            as="h1"
            immediate
            className="font-serif-display text-(length:--text-title) leading-[1.05] mt-3"
          >
            Бүтээлүүд
          </RevealText>
          <p className="mt-4 text-muted max-w-2xl text-(length:--text-lede) leading-relaxed">
            Энд {artists.length} зураачийн хамгийн алдартай бүтээлүүд байна. Нийт цуглуулга{" "}
            {total.toLocaleString("mn-MN")} бүтээлтэй — зураач бүрийн бүрэн жагсаалтыг түүний
            хуудаснаас үзнэ үү.
          </p>
        </header>

        {/* searchParams уншдаг тул Suspense заавал */}
        <Suspense fallback={<WorksGridSkeleton />}>
          <BrowseResults
            works={works}
            searchParams={searchParams}
            pathname="/works"
            artistOptions={artistOptions}
            artistNames={artistNames}
          />
        </Suspense>
      </div>
    </div>
  );
}
