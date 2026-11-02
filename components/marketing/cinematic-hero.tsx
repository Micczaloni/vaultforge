"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

type CinematicHeroProps = {
  backdropSrc: string;
  dragonSrc: string;
  logoSrc?: string;
  gameTitle: string;
  gameHref: string;
  rating?: number | null;
};

/**
 * Cinematic 2.5D hero: painted key art + separate high-res dragon plate,
 * drifting cloud layers (higher z that veil the backdrop), soft fire breath,
 * and scroll/pointer parallax. No low-poly toy models.
 */
export function CinematicHero({
  backdropSrc,
  dragonSrc,
  logoSrc,
  gameTitle,
  gameHref,
  rating,
}: CinematicHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const fireRef = useRef<HTMLCanvasElement>(null);

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
      const sy = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      el.style.setProperty("--sy", sy.toFixed(4));
      el.style.setProperty("--mx", mx.toFixed(4));
      el.style.setProperty("--my", my.toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
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

  // Soft cinematic fire (additive canvas particles — not pixel sprites)
  useEffect(() => {
    const canvas = fireRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let w = 0;
    let h = 0;
    const particles = Array.from({ length: 80 }, (_, i) => ({
      t: (i / 80) * 1.2,
      spread: ((i % 9) - 4) * 0.08,
      speed: 0.55 + (i % 5) * 0.08,
      size: 18 + (i % 6) * 8,
    }));

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * devicePixelRatio));
      h = Math.max(1, Math.round(r.height * devicePixelRatio));
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let last = performance.now();
    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const cycle = (now / 1000) % 4.2;
      const burst =
        cycle < 0.35
          ? cycle / 0.35
          : cycle < 1.6
            ? 1 - (cycle - 0.35) / 1.25
            : 0;
      const energy = Math.max(0, burst);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        p.t += dt * p.speed;
        if (p.t > 1) p.t = 0;
        if (energy < 0.05 && p.t > 0.15) continue;

        const life = p.t;
        const x = w * 0.12 + life * w * 0.72 + p.spread * life * w * 0.35;
        const y =
          h * 0.55 -
          life * h * 0.35 +
          Math.sin(life * 9 + p.spread * 8) * h * 0.04;
        const r =
          p.size * (1 - life * 0.55) * (0.45 + energy) * devicePixelRatio;

        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,245,210,${0.95 * energy * (1 - life)})`);
        g.addColorStop(0.25, `rgba(255,170,50,${0.7 * energy * (1 - life)})`);
        g.addColorStop(0.55, `rgba(255,70,20,${0.35 * energy * (1 - life)})`);
        g.addColorStop(1, "rgba(80,10,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="cine-hero relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden"
    >
      {/* L0 — key art */}
      <div className="cine-bg absolute inset-[-8%]" aria-hidden>
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

      {/* Colour wash — teal/orange cinematic, not void black */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(8,18,42,0.82)_0%,rgba(12,28,64,0.35)_45%,rgba(255,110,40,0.12)_100%)]"
      />

      {/* L1 — mid clouds (veil the backdrop) */}
      <div
        className="cine-cloud-mid pointer-events-none absolute inset-[-10%]"
        aria-hidden
      >
        <div className="cine-cloud-drift-a absolute inset-0">
          <Image
            src="/hero/cloud-a.png"
            alt=""
            fill
            unoptimized
            className="object-cover opacity-70 mix-blend-screen"
            sizes="100vw"
          />
        </div>
      </div>

      {/* L2 — dragon plate + fire */}
      <div className="cine-dragon pointer-events-none absolute" aria-hidden>
        <div className="cine-dragon-float relative h-full w-full">
          <Image
            src={dragonSrc}
            alt=""
            fill
            priority
            unoptimized
            className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.65)]"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <canvas
            ref={fireRef}
            className="cine-fire pointer-events-none absolute"
            aria-hidden
          />
          <div className="cine-fire-glow" />
        </div>
      </div>

      {/* L3 — foreground clouds (higher z, partially cover dragon + backdrop) */}
      <div
        className="cine-cloud-fg pointer-events-none absolute inset-[-12%]"
        aria-hidden
      >
        <div className="cine-cloud-drift-b absolute inset-0">
          <Image
            src="/hero/cloud-b.png"
            alt=""
            fill
            unoptimized
            className="object-cover opacity-55 mix-blend-screen"
            sizes="100vw"
          />
        </div>
        <div className="cine-cloud-drift-c absolute inset-0">
          <Image
            src="/hero/cloud-c.png"
            alt=""
            fill
            unoptimized
            className="object-contain object-[80%_70%] opacity-45 mix-blend-screen"
            sizes="80vw"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0b1430] via-[#0b1430]/75 to-transparent"
      />

      {/* Copy */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="cine-copy max-w-xl space-y-8">
          <p className="animate-rise font-mono text-xs tracking-[0.28em] text-cyan-300 uppercase drop-shadow">
            Vaultforge
          </p>
          <div className="animate-rise-delay space-y-4">
            <h1 className="text-5xl leading-[0.95] font-semibold tracking-tight text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.65)] sm:text-6xl lg:text-7xl">
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

      <Link
        href={gameHref}
        className="group absolute right-4 bottom-5 z-20 flex items-center gap-3 rounded-xl border border-white/15 bg-black/40 px-3 py-2 backdrop-blur-md transition-colors hover:bg-black/60 sm:right-6"
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

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 md:flex"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <span className="animate-scroll-cue block h-8 w-px bg-gradient-to-b from-white/70 to-transparent" />
      </div>
    </section>
  );
}
