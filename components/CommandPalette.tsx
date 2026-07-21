"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type SearchDoc = {
  /** Очих зам */
  href: string;
  /** Үндсэн текст */
  label: string;
  /** Дэд текст (зураач, он г.м.) */
  sub: string;
  /** "Зураач" | "Бүтээл" | "Хөдөлгөөн" */
  kind: string;
  /** Хайлтын доод регистрийн текст */
  hay: string;
};

/**
 * ⌘K / Ctrl+K командын палитр. Нэмэлт сан ашиглахгүй — энгийн substring
 * хайлт. Индекс нь ~50 зураач + топ бүтээл + хөдөлгөөн (~60KB) тул шүүлт
 * шууд ажиллана.
 */
export default function CommandPalette({ docs }: { docs: SearchDoc[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K → нээх, «/» → нээх
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !isTyping()) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) {
      return docs.filter((d) => d.kind === "Зураач").slice(0, 8);
    }
    const terms = needle.split(/\s+/);
    return docs
      .filter((d) => terms.every((t) => d.hay.includes(t)))
      .slice(0, 20);
  }, [q, docs]);

  useEffect(() => setActive(0), [q]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].href); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Хайх"
        className="inline-flex items-center gap-2 label border border-line rounded-full px-3 py-1.5 text-ink/70 hover:border-accent/50 hover:text-ink transition-colors"
      >
        <span className="text-base leading-none">⌘</span>
        <span className="hidden sm:inline">Хайх</span>
        <kbd className="hidden md:inline text-[0.6rem] border border-line rounded px-1">K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
          <button aria-label="Хаах" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-bg border border-line rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Зураач, бүтээл, хөдөлгөөн хайх…"
              className="w-full bg-transparent px-5 py-4 text-lg text-ink placeholder:text-muted outline-none border-b border-line"
            />
            <ul className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 && (
                <li className="px-5 py-8 text-center text-muted text-sm">Юу ч олдсонгүй</li>
              )}
              {results.map((d, i) => (
                <li key={d.href}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(d.href)}
                    className={`w-full text-left px-5 py-2.5 flex items-center justify-between gap-4 ${
                      i === active ? "bg-raise" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{d.label}</span>
                      <span className="block truncate text-xs text-muted">{d.sub}</span>
                    </span>
                    <span className="label shrink-0">{d.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function isTyping() {
  const el = document.activeElement;
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}
