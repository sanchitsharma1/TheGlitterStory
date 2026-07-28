"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  title: string;
  soldOut?: boolean;
};

export function ProductGallery({ images, title, soldOut }: Props) {
  const gallery = images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);

  const hasImages = gallery.length > 0;
  const current = hasImages ? gallery[Math.min(active, gallery.length - 1)] : null;

  const openLightbox = () => {
    if (!hasImages) return;
    setZoom(1);
    setLightbox(true);
  };

  const closeLightbox = useCallback(() => {
    setLightbox(false);
    setZoom(1);
  }, []);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (gallery.length < 2) return;
      setActive((i) => (i + dir + gallery.length) % gallery.length);
      setZoom(1);
    },
    [gallery.length]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.25));
      if (e.key === "-") setZoom((z) => Math.max(1, z - 0.25));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, closeLightbox, go]);

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={openLightbox}
          className={cn(
            "relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-ink/8 bg-stone-100 text-left",
            hasImages && "cursor-zoom-in group"
          )}
          aria-label={hasImages ? "View larger image" : undefined}
          disabled={!hasImages}
        >
          {current ? (
            <Image
              src={current}
              alt={title}
              fill
              priority
              className={cn(
                "object-cover transition duration-300 group-hover:scale-[1.02]",
                soldOut && "grayscale"
              )}
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.18em] text-ink/30">
              Image coming soon
            </div>
          )}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/25">
              <Badge tone="sold" className="px-4 py-1 text-sm">
                Sold
              </Badge>
            </div>
          )}
          {hasImages && !soldOut && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur">
              <ZoomIn size={14} /> Zoom
            </span>
          )}
        </button>

        {gallery.length > 1 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {gallery.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl border bg-stone-100 transition",
                  active === index
                    ? "border-ink ring-2 ring-gold/50"
                    : "border-ink/8 hover:border-ink/30"
                )}
                aria-label={`View image ${index + 1}`}
                aria-current={active === index}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && current && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-ink/92 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-ivory sm:px-6">
            <p className="truncate font-display text-lg">{title}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-white/10"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <span className="min-w-[3rem] text-center text-sm tabular-nums text-ivory/70">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-white/10"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
              <button
                type="button"
                className="ml-1 rounded-full p-2 hover:bg-white/10"
                onClick={closeLightbox}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto px-4 pb-8">
            {gallery.length > 1 && (
              <button
                type="button"
                className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-ivory hover:bg-white/20 sm:left-4"
                onClick={() => go(-1)}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div
              className="relative max-h-full max-w-full transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
                cursor: zoom > 1 ? "grab" : "default",
              }}
              onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current}
                alt={title}
                className="max-h-[min(80vh,900px)] max-w-[min(92vw,900px)] object-contain select-none"
                draggable={false}
              />
            </div>

            {gallery.length > 1 && (
              <button
                type="button"
                className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-ivory hover:bg-white/20 sm:right-4"
                onClick={() => go(1)}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex justify-center gap-2 px-4 pb-5">
              {gallery.map((src, index) => (
                <button
                  key={`lb-${src}-${index}`}
                  type="button"
                  onClick={() => {
                    setActive(index);
                    setZoom(1);
                  }}
                  className={cn(
                    "h-14 w-12 overflow-hidden rounded-lg border",
                    active === index ? "border-gold" : "border-white/20 opacity-70"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
