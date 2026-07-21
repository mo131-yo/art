"use client";

import { useState } from "react";

type Props = {
  title: string;
  text?: string;
};

/**
 * Утсанд системийн жинхэнэ хуваалцах цэс гаргана (Web Share API).
 * Дэмжигдээгүй browser-т хаягийг clipboard руу хуулна.
 */
export default function ShareButton({ title, text }: Props) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // Хэрэглэгч цуцалсан эсвэл хуваалцах боломжгүй — хуулах руу шилжинэ
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard ч боломжгүй — чимээгүй өнгөрнө
    }
  };

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 border border-line text-ink/75 rounded-full px-4 py-2 label hover:border-accent/50 hover:text-ink transition-colors"
    >
      <span aria-hidden>⇪</span>
      {copied ? "Хуулагдлаа" : "Хуваалцах"}
    </button>
  );
}
