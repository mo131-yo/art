export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 md:px-10 text-sm text-muted">
      <p>
        Зургийн мэдээллийг{" "}
        <a
          href="https://www.artic.edu/open-access/public-api"
          className="underline hover:text-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          Art Institute of Chicago
        </a>{" "}
        болон Wikimedia Commons-оос авав. Бүх зураг нийтийн өмч.
      </p>
    </footer>
  );
}
