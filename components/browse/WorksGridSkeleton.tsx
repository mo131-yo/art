/** Шүүлтийн үр дүн ирэхийг хүлээх үеийн орлуулагч — өндөр нь санамсаргүй биш,
 *  жинхэнэ зургууд шиг харилцан адилгүй байхаар давтагдана. */
const HEIGHTS = [260, 340, 200, 300, 380, 240, 320, 280, 360, 220, 300, 260];

export default function WorksGridSkeleton() {
  return (
    <div className="columns-2 md:columns-3 xl:columns-4 gap-6 animate-pulse" aria-hidden>
      {HEIGHTS.map((h, i) => (
        <div key={i} className="break-inside-avoid mb-8">
          <div className="bg-raise" style={{ height: h }} />
          <div className="h-4 bg-raise mt-3 w-3/4" />
          <div className="h-3 bg-raise mt-2 w-1/2" />
        </div>
      ))}
    </div>
  );
}
