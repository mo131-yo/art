"use client";

import { useEffect, useState } from "react";

/**
 * Сүлжээ тасрахад дээд талд нимгэн зурвас гаргана.
 *
 * Шүүлтүүр нь сервер талд ажилладаг тул офлайнд шинэ шүүлт хийх боломжгүй —
 * хэрэглэгч «эвдэрсэн» гэж бодохоос сэргийлж үүнийг шууд хэлнэ.
 */
export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[70] bg-accent text-bg text-center py-1.5 px-4 text-xs tracking-wide"
    >
      Сүлжээгүй байна — хадгалсан хуудсууд ажиллана, шинэ хайлт хийх боломжгүй.
    </div>
  );
}
