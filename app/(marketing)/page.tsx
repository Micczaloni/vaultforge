import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { Button } from "@/components/ui/button";
import {
  demoCoverUrl,
  steamAppIdFromCoverUrl,
  steamLibraryHero,
} from "@/lib/games/covers";
import { prisma } from "@/lib/db/prisma";

export const instant = false;

const FALLBACK_HERO_APP_ID = "1086940"; // Baldur's Gate 3 — vivid key art

export default async function LandingPage() {
  await connection();

  let featured: Array<{
    slug: string;
    title: string;
    coverUrl: string | null;
    rating: number | null;
  }> = [];

  try {
    featured = await prisma.game.findMany({
      orderBy: { rating: "desc" },
      take: 10,
      select: { slug: true, title: true, coverUrl: true, rating: true },
    });
  } catch {
    featured = [];
  }

  const heroGame = featured[0];
  const heroAppId =
    steamAppIdFromCoverUrl(heroGame?.coverUrl) ?? FALLBACK_HERO_APP_ID;
  const heroSrc = steamLibraryHero(heroAppId);

  return (
    <div className="relative">
      <section className="relative isolate min-h-[calc(100vh-3.5rem)] overflow-hidden">
        <HeroBackdrop
          src={heroSrc}
          alt={heroGame ? `${heroGame.title} key art` : "Featured game art"}
        />

        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
          <div className="max-w-xl space-y-8">
            <p className="animate-rise font-mono text-xs tracking-[0.28em] text-cyan-300 uppercase drop-shadow">
              Vaultforge
            </p>
            <div className="animate-rise-delay space-y-4">
              <h1 className="text-5xl leading-[0.95] font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl">
                Your games.
                <br />
                Your record.
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Your forge.
                </span>
              </h1>
              <p className="max-w-md text-lg text-balance text-white/85 drop-shadow">
                Track play status, discover titles, unlock achievements, and
                climb the leaderboard — with real game art front and center.
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
            {heroGame ? (
              <p className="animate-rise-delay-2 font-mono text-xs text-white/65">
                Backdrop · {heroGame.title}
                {heroGame.rating != null
                  ? ` · ★ ${heroGame.rating.toFixed(1)}`
                  : ""}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-gradient-to-b from-[#0b1430] via-[#12204a] to-[#0f1a38] py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(34,211,238,0.18),transparent_45%),radial-gradient(ellipse_at_90%_20%,rgba(244,114,182,0.16),transparent_40%)]"
        />
        <div className="relative mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-cyan-300 uppercase">
                Featured
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Hot in the vault
              </h2>
            </div>
            <Button
              variant="ghost"
              className="text-cyan-200 hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/games">View all →</Link>
            </Button>
          </div>

          <div className="flex [scrollbar-width:none] gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {(featured.length > 0
              ? featured
              : Array.from({ length: 6 }).map((_, index) => ({
                  slug: `demo-${index}`,
                  title: "Coming soon",
                  coverUrl: demoCoverUrl(`demo-${index}`),
                  rating: null as number | null,
                }))
            ).map((game) => (
              <Link
                key={game.slug}
                href={featured.length ? `/games/${game.slug}` : "/games"}
                className="group relative aspect-[3/4] w-[140px] shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-1 hover:ring-cyan-300/50 sm:w-[160px]"
              >
                <Image
                  src={game.coverUrl || demoCoverUrl(game.slug)}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="160px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1430]/95 via-[#0b1430]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-2.5">
                  <p className="line-clamp-2 text-xs leading-snug font-semibold text-white">
                    {game.title}
                  </p>
                  {game.rating != null ? (
                    <p className="font-mono text-[10px] text-cyan-300">
                      ★ {game.rating.toFixed(1)}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur-md">
            <p className="font-medium text-white">Demo login</p>
            <p className="mt-1 font-mono text-xs text-white/75 sm:text-sm">
              admin@vaultforge.dev · Password123! &nbsp;·&nbsp;
              aria@vaultforge.dev · Password123!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
