"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

type TiltSpotlightProps = {
  href: string;
  imageSrc: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
};

/**
 * Ink Games–style tilted media panel — CSS 3D tilt on pointer, no WebGL.
 */
export function TiltSpotlight({
  href,
  imageSrc,
  eyebrow,
  title,
  body,
  cta,
}: TiltSpotlightProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      ref={cardRef}
      href={href}
      className="tilt-spotlight group relative block overflow-hidden rounded-2xl ring-1 ring-white/15"
      onPointerMove={(e) => {
        const el = cardRef.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
      }}
      onPointerLeave={() => {
        const el = cardRef.current;
        if (!el) return;
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      }}
    >
      <div className="tilt-spotlight-inner relative aspect-[16/9] w-full sm:aspect-[21/9]">
        <Image
          src={imageSrc}
          alt=""
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1430]/95 via-[#0b1430]/55 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:max-w-lg sm:p-10">
          <p className="font-mono text-xs tracking-[0.22em] text-cyan-300 uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-white/75 sm:text-base">{body}</p>
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition group-hover:bg-white/20">
            {cta} →
          </span>
        </div>
      </div>
    </Link>
  );
}
