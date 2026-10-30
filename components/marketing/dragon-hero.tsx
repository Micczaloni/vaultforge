"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

type DragonHeroProps = {
  backdropSrc: string;
  cutoutSrc: string;
  logoSrc?: string;
  gameTitle: string;
  gameHref: string;
  rating?: number | null;
};

const FLAMES = Array.from({ length: 14 }, (_, i) => i);
const EMBERS = Array.from({ length: 18 }, (_, i) => i);

/**
 * Layered "2.5D" hero: key art backdrop, a cut-out dragon floating above it,
 * scroll + pointer parallax, and a fire-breath particle burst at the mouth.
 * All motion is driven through CSS variables so React never re-renders on scroll.
 */
export function DragonHero({
  backdropSrc,
  cutoutSrc,
  logoSrc,
  gameTitle,
  gameHref,
  rating,
}: DragonHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    let raf = 0;
    let mx = 0;
    let my = 0;

    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      el.style.setProperty("--sy", progress.toFixed(4));
      el.style.setProperty("--mx", mx.toFixed(4));
      el.style.setProperty("--my", my.toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width - 0.5;
      my = (e.clientY - rect.top) / rect.height - 0.5;
      schedule();
    };
    const onLeave = () => {
      mx = 0;
      my = 0;
      schedule();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    apply();
    return () => {
      window.removeEventListener("scroll", schedule);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-stage relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden"
      style={
        {
          "--sy": 0,
          "--mx": 0,
          "--my": 0,
        } as React.CSSProperties
      }
    >
      {/* Layer 0 — key art, slow parallax */}
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

      {/* Colour wash so it reads vivid, not murky */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(9,18,46,0.86)_0%,rgba(14,32,80,0.55)_38%,rgba(14,32,80,0.15)_60%,rgba(255,96,64,0.12)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0b1430] via-[#0b1430]/70 to-transparent"
      />

      {/* Layer 1 — fire breath (behind the dragon's head, in front of backdrop) */}
      <div
        className="hero-layer-dragon pointer-events-none absolute"
        aria-hidden
      >
        <div className="hero-fire">
          <div className="hero-fire-glow" />
          {FLAMES.map((i) => (
            <span
              key={i}
              className="hero-flame"
              style={
                {
                  "--i": i,
                  "--d": `${(i * 0.09).toFixed(2)}s`,
                  "--spread": `${((i % 5) - 2) * 9}deg`,
                  "--len": `${180 + (i % 4) * 60}px`,
                } as React.CSSProperties
              }
            />
          ))}
          {EMBERS.map((i) => (
            <span
              key={`e-${i}`}
              className="hero-ember"
              style={
                {
                  "--i": i,
                  "--d": `${(i * 0.23).toFixed(2)}s`,
                  "--x": `${80 + (i % 6) * 55}px`,
                  "--y": `${-40 - (i % 5) * 28}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Layer 2 — cut-out dragon, pops toward the viewer on scroll */}
        <div className="hero-dragon-float absolute inset-0">
          <Image
            src={cutoutSrc}
            alt=""
            fill
            priority
            unoptimized
            className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)]"
            sizes="(max-width: 768px) 90vw, 55vw"
          />
        </div>
      </div>

      {/* Copy */}
      <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="hero-copy max-w-xl space-y-8">
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
        </span>
      </Link>

      {/* Scroll cue */}
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
