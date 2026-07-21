import Link from "next/link";
import { buildHref, type Filters } from "@/lib/filters";

/**
 * Infinite scroll биш жинхэнэ хуудаслалт: хуудасны дугаар URL-д үлдэж,
 * буцах товч ажиллаж, ScrollSmoother-той зөрчилдөхгүй.
 */
export default function Pagination({
  pathname, filters, pages,
}: {
  pathname: string;
  filters: Filters;
  pages: number;
}) {
  if (pages <= 1) return null;

  const current = Math.min(filters.page, pages);
  const window: number[] = [];
  for (let p = Math.max(1, current - 2); p <= Math.min(pages, current + 2); p++) window.push(p);

  return (
    <nav className="flex items-center justify-center gap-2 pt-16" aria-label="Хуудаслалт">
      {current > 1 && <PageLink pathname={pathname} filters={filters} page={current - 1}>←</PageLink>}

      {window[0] > 1 && (
        <>
          <PageLink pathname={pathname} filters={filters} page={1}>1</PageLink>
          {window[0] > 2 && <span className="text-muted px-1">…</span>}
        </>
      )}

      {window.map((p) => (
        <PageLink key={p} pathname={pathname} filters={filters} page={p} current={p === current}>
          {p}
        </PageLink>
      ))}

      {window[window.length - 1] < pages && (
        <>
          {window[window.length - 1] < pages - 1 && <span className="text-muted px-1">…</span>}
          <PageLink pathname={pathname} filters={filters} page={pages}>{pages}</PageLink>
        </>
      )}

      {current < pages && <PageLink pathname={pathname} filters={filters} page={current + 1}>→</PageLink>}
    </nav>
  );
}

function PageLink({
  pathname, filters, page, current, children,
}: {
  pathname: string;
  filters: Filters;
  page: number;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={buildHref(pathname, filters, { page })}
      aria-current={current ? "page" : undefined}
      className={`min-w-10 text-center text-sm rounded-full px-3 py-2 border transition-colors ${
        current
          ? "border-accent bg-accent text-bg"
          : "border-line text-ink/75 hover:border-accent/50 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
