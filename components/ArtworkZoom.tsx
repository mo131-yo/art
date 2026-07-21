"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";

type Props = {
  /** Хуудсанд харагдах зураг (жижиг хувилбар) */
  children: React.ReactNode;
  /** Эмхэтгэж үзэх өндөр нягтралтай зургийн URL */
  src: string;
  alt: string;
};

/**
 * Бүтэн дэлгэцийн зураг харагч.
 *
 * Нэмэлт сан ашиглахгүй — native <dialog> нь Escape товч, фокусын урхи,
 * дэвсгэрийг идэвхгүй болгох зэргийг өөрөө хийдэг.
 */
export default function ArtworkZoom({ children, src, alt }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [open, setOpen] = useState(false);

  // Нээлттэй үед хуудасны гүйлт зогсоно — эс бөгөөс ард нь ScrollSmoother гүйнэ
  useEffect(() => {
    if (!open) return;
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    document.body.style.overflow = "hidden";
    return () => {
      smoother?.paused(false);
      document.body.style.overflow = "";
    };
  }, [open]);

  const show = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };

  const hide = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <button
        onClick={show}
        className="block w-full cursor-zoom-in"
        aria-label={`${alt} — томруулж үзэх`}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => {
          setOpen(false);
          setZoomed(false);
        }}
        className="backdrop:bg-black/90 bg-transparent max-w-none max-h-none w-screen h-screen p-0 m-0"
      >
        {open && (
          <div className="relative w-screen h-screen flex items-center justify-center bg-black/95">
            <div className={`w-full h-full ${zoomed ? "overflow-auto" : "flex items-center justify-center p-4"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                onClick={() => setZoomed((z) => !z)}
                className={
                  zoomed
                    ? "max-w-none cursor-zoom-out"
                    : "max-w-full max-h-full object-contain cursor-zoom-in"
                }
              />
            </div>

            <button
              onClick={hide}
              className="absolute top-5 right-5 text-white/80 hover:text-white text-3xl leading-none w-12 h-12 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
              aria-label="Хаах"
            >
              ✕
            </button>

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-[0.2em] uppercase pointer-events-none">
              {zoomed ? "Дарж багасгана" : "Дарж томруулна"} · Esc — хаах
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
