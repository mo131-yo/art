import type { Metadata } from "next";
import RevealText from "@/components/gsap/RevealText";
import FavoritesGrid from "@/components/favorites/FavoritesGrid";

export const metadata: Metadata = {
  title: "Дуртай бүтээлүүд",
  description: "Өөрийн хадгалсан бүтээлүүд — офлайнд ч харагдана.",
};

export default function FavoritesPage() {
  return (
    <div className="bg-bg text-ink min-h-screen">
      <div className="px-6 md:px-10 pt-32 pb-24 max-w-[100rem] mx-auto">
        <header className="mb-8">
          <p className="label">Миний цуглуулга</p>
          <RevealText
            as="h1"
            immediate
            className="font-serif-display text-(length:--text-title) leading-[1.05] mt-3"
          >
            Дуртай бүтээлүүд
          </RevealText>
          <p className="mt-4 text-muted max-w-2xl text-(length:--text-lede) leading-relaxed">
            Энэ жагсаалт зөвхөн таны утсанд хадгалагдана — бүртгүүлэх шаардлагагүй,
            сүлжээгүй үед ч нээгдэнэ.
          </p>
        </header>

        <FavoritesGrid />
      </div>
    </div>
  );
}
