"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type FeaturedSlide = {
  slug: string;
  title: string;
  wideSrc: string;
  coverSrc: string;
  rating: number | null;
  genres?: string[];
};

export function FeaturedCarousel({ slides }: { slides: FeaturedSlide[] }) {
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [
      Autoplay({
        delay: 4200,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>(() => slides.map((_, i) => i));

  useEffect(() => {
    if (!embla) return;
    const sync = () => {
      setSnaps(embla.scrollSnapList());
      setSelected(embla.selectedScrollSnap());
    };
    embla.on("init", sync);
    embla.on("select", sync);
    embla.on("reInit", sync);
    return () => {
      embla.off("init", sync);
      embla.off("select", sync);
      embla.off("reInit", sync);
    };
  }, [embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex touch-pan-y gap-4">
          {slides.map((slide, index) => (
            <Link
              key={slide.slug}
              href={`/games/${slide.slug}`}
              className="group relative aspect-[16/9] min-w-0 shrink-0 basis-[88%] overflow-hidden rounded-2xl ring-1 ring-white/15 transition-[transform,box-shadow] duration-500 hover:ring-cyan-300/60 sm:basis-[60%] lg:basis-[44%]"
              style={{
                transform: index === selected ? "scale(1)" : "scale(0.96)",
                boxShadow:
                  index === selected
                    ? "0 30px 80px rgba(0,0,0,0.55)"
                    : "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >
              <Image
                src={slide.wideSrc}
                alt=""
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 60vw, 44vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1430] via-[#0b1430]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
                <div className="relative hidden h-24 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-white/20 sm:block">
                  <Image
                    src={slide.coverSrc}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-lg font-semibold text-white">
                    {slide.title}
                  </p>
                  <p className="font-mono text-xs text-cyan-300">
                    {slide.rating != null ? `★ ${slide.rating.toFixed(1)}` : ""}
                    {slide.genres?.length
                      ? `  ·  ${slide.genres.slice(0, 2).join(" / ")}`
                      : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === selected ? "true" : undefined}
              onClick={() => embla?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === selected
                  ? "w-8 bg-cyan-300"
                  : "w-3 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
