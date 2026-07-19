import SmoothScroll from "@/components/gsap/SmoothScroll";
import SiteFooter from "@/components/SiteFooter";

/**
 * template.tsx нь навигаци бүрд дахин mount хийгддэг тул ScrollSmoother
 * хуудас бүрд цэвэрхэн шинээр үүсч, scroll байрлал зөв эхэлнэ.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      {children}
      <SiteFooter />
    </SmoothScroll>
  );
}
