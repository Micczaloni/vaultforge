"use client";

import Image from "next/image";

type HeroBackdropProps = {
  src: string;
  alt?: string;
};

/**
 * Full-bleed cinematic game art with a slow Ken Burns drift —
 * recognizably "games", not abstract geometry.
 */
export function HeroBackdrop({ src, alt = "" }: HeroBackdropProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="animate-hero-drift absolute inset-[-4%]">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className="object-cover object-[60%_center]"
          sizes="100vw"
        />
      </div>
      {/* Colorful wash so the page feels lively, not black void */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(12,24,56,0.78)_0%,rgba(18,40,90,0.45)_42%,rgba(255,92,122,0.18)_72%,rgba(34,211,238,0.22)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_0%,rgba(8,14,32,0.35)_70%,rgba(8,14,32,0.72)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b1430] to-transparent" />
    </div>
  );
}
