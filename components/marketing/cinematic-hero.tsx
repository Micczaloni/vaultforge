"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

export type FloatProp = {
  src: string;
  alt?: string;
  /** depth 0 = far (moves less), 1 = near (moves more) */
  depth: number;
  className: string;
  rotate?: number;
};

type CinematicHeroProps = {
  backdropSrc: string;
  dragonSrc: string;
  floatProps?: FloatProp[];
  logoSrc?: string;
  gameTitle: string;
  gameHref: string;
  rating?: number | null;
};

/**
 * Ink Games–style depth: giant type behind floating art plates that track
 * the pointer at different depths. D&D–style cinematic backdrop + scroll cue,
 * without heavy WebGL (keeps 60fps).
 */
export function CinematicHero({
  backdropSrc,
  dragonSrc,
  floatProps = [],
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
    let tx = 0;
    let ty = 0;

    const apply = () => {
      const rect = el.getBoundingClientRect();
      const sy = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
      // Ease pointer so motion feels weighty (Ink-like), not twitchy.
      tx += (mx - tx) * 0.08;
      ty += (my - ty) * 0.08;
      el.style.setProperty("--sy", sy.toFixed(4));
      el.style.setProperty("--mx", tx.toFixed(4));
      el.style.setProperty("--my", ty.toFixed(4));
      raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    };
    const onLeave = () => {
      mx = 0;
      my = 0;
    };

    window.addEventListener("scroll", () => {}, { passive: true });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(apply);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const canvas = fireRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let w = 0;
    let h = 0;
    const particles = Array.from({ length: 56 }, (_, i) => ({
      t: (i / 56) * 1.2,
      spread: ((i % 9) - 4) * 0.08,
      speed: 0.55 + (i % 5) * 0.08,
      size: 16 + (i % 6) * 7,
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
      const energy =
        cycle < 0.35
          ? cycle / 0.35
          : cycle < 1.55
            ? 1 - (cycle - 0.35) / 1.2
            : 0;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        p.t += dt * p.speed;
        if (p.t > 1) p.t = 0;
        if (energy < 0.05 && p.t > 0.15) continue;
        const life = p.t;
        const x = w * 0.12 + life * w * 0.7 + p.spread * life * w * 0.35;
        const y =
          h * 0.55 -
          life * h * 0.35 +
          Math.sin(life * 9 + p.spread * 8) * h * 0.04;
        const r =
          p.size * (1 - life * 0.55) * (0.4 + energy) * devicePixelRatio;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,245,210,${0.9 * energy * (1 - life)})`);
        g.addColorStop(0.3, `rgba(255,160,45,${0.65 * energy * (1 - life)})`);
        g.addColorStop(0.65, `rgba(255,70,20,${0.3 * energy * (1 - life)})`);
        g.addColorStop(1, "rgba(60,8,0,0)");
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
      {/* Backdrop — D&D cinematic plane */}
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(6,12,28,0.55)_0%,rgba(10,22,48,0.15)_50%,rgba(255,110,40,0.08)_100%)]"
      />

      {/* Mid clouds */}
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
            className="object-cover opacity-55 mix-blend-screen"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Ink-style giant type — sits BEHIND floating plates */}
      <div
        aria-hidden
        className="cine-giant-type pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-4"
      >
        <p className="max-w-6xl text-center text-[12vw] leading-[0.85] font-semibold tracking-[-0.04em] text-white/12 uppercase select-none sm:text-[9vw] lg:text-[7.5vw]">
          Your games
          <br />
          Your forge
        </p>
      </div>

      {/* Floating depth stage — Ink Games principle */}
      <div className="cine-float-stage pointer-events-none absolute inset-0 z-[3]">
        {floatProps.map((prop, i) => (
          <div
            key={`${prop.src}-${i}`}
            className={`cine-float absolute ${prop.className}`}
            style={
              {
                "--d": prop.depth,
                "--rot": `${prop.rotate ?? 0}deg`,
              } as React.CSSProperties
            }
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/20">
              <Image
                src={prop.src}
                alt={prop.alt ?? ""}
                fill
                unoptimized
                className="object-cover"
                sizes="180px"
              />
            </div>
          </div>
        ))}

        {/* Dragon plate — nearest depth, overlaps type */}
        <div className="cine-dragon absolute">
          <div className="cine-dragon-float relative h-full w-full">
            <Image
              src={dragonSrc}
              alt=""
              fill
              priority
              unoptimized
              className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
            <canvas
              ref={fireRef}
              className="cine-fire pointer-events-none absolute"
              aria-hidden
            />
            <div className="cine-fire-glow" />
          </div>
        </div>
      </div>

      {/* Foreground clouds — highest veil */}
      <div
        className="cine-cloud-fg pointer-events-none absolute inset-[-12%] z-[4]"
        aria-hidden
      >
        <div className="cine-cloud-drift-b absolute inset-0">
          <Image
            src="/hero/cloud-b.png"
            alt=""
            fill
            unoptimized
            className="object-cover opacity-45 mix-blend-screen"
            sizes="100vw"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-44 bg-gradient-to-t from-[#0b1430] via-[#0b1430]/75 to-transparent"
      />

      {/* Readable CTA copy — left, above floats on mobile via stack */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="cine-copy max-w-md space-y-6">
          <p className="animate-rise font-mono text-xs tracking-[0.28em] text-cyan-300 uppercase">
            Vaultforge
          </p>
          <div className="animate-rise-delay space-y-3">
            <h1 className="text-4xl leading-[0.95] font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your games.
              <br />
              Your record.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-orange-300 bg-clip-text text-transparent">
                Your forge.
              </span>
            </h1>
            <p className="text-base text-balance text-white/80">
              Track play, unlock achievements, climb the leaderboard — with real
              game art front and center.
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
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href="/games">Browse games</Link>
            </Button>
          </div>
        </div>
      </div>

      <Link
        href={gameHref}
        className="group absolute right-4 bottom-5 z-20 flex max-w-[220px] items-center gap-3 rounded-xl border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md transition-colors hover:bg-black/65 sm:right-6"
      >
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt=""
            width={100}
            height={36}
            unoptimized
            className="h-7 w-auto object-contain"
          />
        ) : null}
        <span className="min-w-0 text-xs text-white/80">
          <span className="block font-mono tracking-wider text-white/50 uppercase">
            Featured
          </span>
          <span className="line-clamp-1 font-medium text-white group-hover:text-cyan-200">
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
