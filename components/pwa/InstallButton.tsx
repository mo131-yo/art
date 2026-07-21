"use client";

import { useEffect, useState } from "react";

/** Chromium-ийн стандартчлагдаагүй event — TS-д тодорхойлолт байдаггүй */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * «Апп болгож суулгах» товч.
 *
 * Chromium дээр `beforeinstallprompt`-ыг барьж, дарахад жинхэнэ суулгах цонх
 * гаргана. iOS Safari энэ event-ийг дэмждэггүй тул тэнд гараар хийх зааврыг
 * харуулна. Аль хэдийн суулгасан (standalone) бол огт харагдахгүй.
 */
export default function InstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(true); // мэдэгдэх хүртэл нуугдана

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari-гийн стандартчлагдаагүй шинж
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault(); // browser-ийн өөрийн санааг таслаад бид өөрсдөө гаргана
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  // iOS дээр event байхгүй тул зөвхөн зааврыг санал болгоно
  if (!prompt && !isIos) return null;

  const onClick = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setPrompt(null);
      return;
    }
    setShowIosHelp((v) => !v);
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 border border-accent/60 text-accent px-4 py-1.5 label rounded-full hover:bg-accent hover:text-bg transition-colors"
      >
        <span aria-hidden>⬇</span>
        Апп болгох
      </button>

      {showIosHelp && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-bg border border-line rounded-lg p-4 shadow-2xl shadow-black/60 z-50">
          <p className="label mb-2">iPhone дээр суулгах</p>
          <ol className="text-sm text-muted space-y-1.5 leading-relaxed">
            <li>1. Доод талын «Хуваалцах» товчийг дарна</li>
            <li>2. «Add to Home Screen» сонгоно</li>
            <li>3. «Add» дарна</li>
          </ol>
          <button
            onClick={() => setShowIosHelp(false)}
            className="label mt-3 hover:text-accent transition-colors"
          >
            Ойлголоо
          </button>
        </div>
      )}
    </div>
  );
}
