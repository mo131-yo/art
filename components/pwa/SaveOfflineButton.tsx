"use client";

import { useEffect, useState } from "react";

type Props = {
  slug: string;
  artistName: string;
  /** Серверт бэлдсэн жагсаалт: татах зураг ба хуудаснуудын URL */
  urls: string[];
};

type State = "idle" | "saving" | "saved" | "unsupported";

const savedKey = (slug: string) => `art-offline-${slug}`;

/**
 * Зураачийн бүтээлүүдийг офлайнд татна.
 *
 * URL-уудыг service worker рүү мессежээр илгээж, тэр `art-offline` кэшэд
 * хийнэ (`public/sw.js` → `cacheUrls`). Энэ кэш автомат цэвэрлэгээнд
 * хамаарахгүй тул хэрэглэгчийн зориуд татсан зүйл устахгүй.
 */
export default function SaveOfflineButton({ slug, artistName, urls }: Props) {
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) {
      setState("unsupported");
      return;
    }
    if (localStorage.getItem(savedKey(slug))) setState("saved");
  }, [slug]);

  useEffect(() => {
    if (state !== "saving") return;

    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "CACHE_PROGRESS") {
        setProgress(Math.round((data.done / data.total) * 100));
      } else if (data?.type === "CACHE_DONE") {
        // Зарим зураг унасан ч үлдсэн нь ажиллана — амжилттай гэж үзнэ
        localStorage.setItem(savedKey(slug), String(Date.now()));
        setState("saved");
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [state, slug]);

  const save = async () => {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) return;
    setProgress(0);
    setState("saving");
    reg.active.postMessage({ type: "CACHE_URLS", urls });
  };

  if (state === "unsupported") return null;

  if (state === "saved") {
    return (
      <p className="label flex items-center gap-2 text-accent">
        <span aria-hidden>✓</span> Офлайнд бэлэн
      </p>
    );
  }

  if (state === "saving") {
    return (
      <div className="w-full max-w-xs">
        <p className="label mb-2">Татаж байна… {progress}%</p>
        <div className="h-px bg-line overflow-hidden">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={save}
      className="inline-flex items-center gap-2 border border-line text-ink/80 px-6 py-3 label rounded-full hover:border-accent/50 hover:text-ink transition-colors"
    >
      <span aria-hidden>↓</span>
      Офлайнд хадгалах
      <span className="text-muted normal-case tracking-normal">
        · {artistName}-ийн шилдэг бүтээлүүд
      </span>
    </button>
  );
}
