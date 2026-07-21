export default function SiteFooter() {
  return (
    <footer className="border-t border-line px-6 py-10 md:px-10 text-sm text-muted">
      <div className="max-w-[100rem] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="font-serif-display text-lg text-ink tracking-[0.2em] uppercase">
          Их мастерууд
        </p>
        <p className="max-w-xl">
          Бүтээл, метадатыг{" "}
          <a
            href="https://www.wikidata.org"
            className="underline hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wikidata
          </a>{" "}
          болон{" "}
          <a
            href="https://commons.wikimedia.org"
            className="underline hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wikimedia Commons
          </a>
          -оос авав. Бүх зураг нийтийн өмч.
        </p>
      </div>
    </footer>
  );
}
