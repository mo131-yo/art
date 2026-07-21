import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сүлжээгүй байна",
  description: "Энэ хуудас офлайнд бэлэн болоогүй байна.",
};

/**
 * Service worker нь кэшлэгдээгүй хуудас руу орох үед үүнийг харуулна
 * (`public/sw.js` → `handleNavigate`).
 */
export default function OfflinePage() {
  return (
    <div className="bg-bg text-ink min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="label">Сүлжээгүй</p>
        <h1 className="font-serif-display text-(length:--text-title) leading-[1.05] mt-3">
          Энэ хуудас хадгалагдаагүй байна
        </h1>
        <p className="mt-6 text-muted leading-relaxed">
          Та энэ хуудсыг өмнө нь нээж байгаагүй тул офлайнд харуулах боломжгүй байна.
          Сүлжээндээ холбогдоод дахин оролдоно уу.
        </p>

        <div className="mt-8 border-t border-line pt-8 text-left">
          <p className="label mb-3">Офлайнд ажиллах зүйлс</p>
          <ul className="text-sm text-muted space-y-2 leading-relaxed">
            <li>· Өмнө нь нээсэн бүх хуудас</li>
            <li>· ♡ Дуртай гэж тэмдэглэсэн бүтээлүүд</li>
            <li>· «Офлайнд хадгалах» товч дарж татсан зураачид</li>
          </ul>
          <p className="text-sm text-muted mt-4 leading-relaxed">
            Шүүлтүүр, хайлт нь сервер талд ажилладаг тул офлайнд шинээр
            шүүх боломжгүй.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/favorites"
            className="inline-block border border-accent/60 text-accent px-6 py-3 label hover:bg-accent hover:text-bg transition-colors rounded-full"
          >
            ♡ Дуртай бүтээлүүд
          </Link>
          <Link
            href="/"
            className="inline-block border border-line text-ink/80 px-6 py-3 label hover:border-accent/50 transition-colors rounded-full"
          >
            Нүүр хуудас
          </Link>
        </div>
      </div>
    </div>
  );
}
