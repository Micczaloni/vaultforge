"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const DragonScene = dynamic(
  () =>
    import("@/components/marketing/dragon-scene").then((m) => m.DragonScene),
  { ssr: false },
);

type DragonHeroProps = {
  backdropSrc: string;
  logoSrc?: string;
  gameTitle: string;
  gameHref: string;
  rating?: number | null;
};

/**
 * Cinematic hero: real key art backdrop + a separate rigged 3D dragon
 * (CC0 glTF) that idles, follows the cursor, and breathes fire.
 * Scroll parallax is driven through CSS variables — no React re-renders.
 */
export function DragonHero({
  backdropSrc,
  logoSrc,
  gameTitle,
  gameHref,
  rating,
}: DragonHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setMotionOk(!reduced);
    if (reduced) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      el.style.setProperty("--sy", progress.toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    apply();
    return () => {
      window.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-stage relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden"
    >
      {/* Layer 0 — key art */}
      <div className="hero-layer-bg absolute inset-[-6%]" aria-hidden>
        <Image
          src={backdropSrc}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-[55%_center]"
          sizes="100vw"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(9,18,46,0.88)_0%,rgba(14,32,80,0.55)_38%,rgba(14,32,80,0.12)_60%,rgba(255,96,64,0.10)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0b1430] via-[#0b1430]/70 to-transparent"
      />

      {/* Layer 1 — 3D dragon */}
      <div className="hero-layer-dragon absolute" aria-hidden>
        {motionOk ? <DragonScene trackRef={sectionRef} /> : null}
      </div>

      {/* Copy */}
      <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="hero-copy pointer-events-none max-w-xl space-y-8 [&_a]:pointer-events-auto">
          <p className="animate-rise font-mono text-xs tracking-[0.28em] text-cyan-300 uppercase drop-shadow">
            Vaultforge
          </p>
          <div className="animate-rise-delay space-y-4">
            <h1 className="text-5xl leading-[0.95] font-semibold tracking-tight text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.6)] sm:text-6xl lg:text-7xl">
              Your games.
              <br />
              Your record.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-orange-300 bg-clip-text text-transparent">
                Your forge.
              </span>
            </h1>
            <p className="max-w-md text-lg text-balance text-white/85 drop-shadow">
              Track play status, discover titles, unlock achievements, and climb
              the leaderboard — with real game art front and center.
            </p>
          </div>
          <div className="animate-rise-delay-2 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-cyan-100"
              asChild
            >
              <Link href="/login">Enter the vault</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href="/games">Browse games</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Attribution chip */}
      <Link
        href={gameHref}
        className="group absolute right-4 bottom-5 z-10 flex items-center gap-3 rounded-xl border border-white/15 bg-black/35 px-3 py-2 backdrop-blur-md transition-colors hover:bg-black/55 sm:right-6"
      >
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt=""
            width={120}
            height={40}
            unoptimized
            className="h-8 w-auto object-contain"
          />
        ) : null}
        <span className="text-xs text-white/80">
          <span className="block font-mono tracking-wider text-white/50 uppercase">
            Featured backdrop
          </span>
          <span className="font-medium text-white group-hover:text-cyan-200">
            {gameTitle}
            {rating != null ? ` · ★ ${rating.toFixed(1)}` : ""}
          </span>
          <span className="mt-0.5 block text-[10px] text-white/45">
            3D dragon: “Red Dragon” by Tomek Zamojski (CC BY 3.0)
          </span>
        </span>
      </Link>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 md:flex"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <span className="animate-scroll-cue block h-8 w-px bg-gradient-to-b from-white/70 to-transparent" />
      </div>
    </section>
  );
}
