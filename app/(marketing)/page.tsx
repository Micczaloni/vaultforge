import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { HeroCanvas } from "@/components/marketing/hero-canvas";
import { Button } from "@/components/ui/button";
import { demoCoverUrl } from "@/lib/games/covers";
import { prisma } from "@/lib/db/prisma";

export const instant = false;

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

  return (
    <div className="relative">
      {/* Hero — one composition: brand + line + CTA + 3D forge */}
      <section className="relative isolate min-h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="forge-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-3xl opacity-90 md:w-[55%]">
          <HeroCanvas />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#07090c_0%,rgba(7,9,12,0.88)_42%,rgba(7,9,12,0.35)_70%,transparent_100%)]"
        />

        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
          <div className="max-w-xl space-y-8">
            <p className="animate-rise text-accent font-mono text-xs tracking-[0.28em] uppercase">
              Vaultforge
            </p>
            <div className="animate-rise-delay space-y-4">
              <h1 className="text-foreground text-5xl leading-[0.95] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Your games.
                <br />
                Your record.
                <br />
                <span className="text-primary">Your forge.</span>
              </h1>
              <p className="text-muted-foreground max-w-md text-lg text-balance">
                Track play status, discover titles, unlock achievements, and
                climb the leaderboard.
              </p>
            </div>
            <div className="animate-rise-delay-2 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/login">Enter the vault</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/games">Browse games</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured shelf — below the fold */}
      <section className="border-border/60 relative border-t py-16">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-accent font-mono text-xs tracking-[0.2em] uppercase">
                Featured
              </p>
              <h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Hot in the vault
              </h2>
            </div>
            <Button variant="ghost" asChild>
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
            ).map((game, index) => (
              <Link
                key={game.slug}
                href={featured.length ? `/games/${game.slug}` : "/games"}
                className="group border-border bg-surface relative aspect-[3/4] w-[140px] shrink-0 overflow-hidden rounded-lg border transition-transform duration-300 hover:-translate-y-1 sm:w-[160px]"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <Image
                  src={game.coverUrl || demoCoverUrl(game.slug)}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="160px"
                />
                <div className="from-background absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-90" />
                <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-2.5">
                  <p className="text-foreground line-clamp-2 text-xs leading-snug font-semibold">
                    {game.title}
                  </p>
                  {game.rating != null ? (
                    <p className="text-accent font-mono text-[10px]">
                      ★ {game.rating.toFixed(1)}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          <div className="border-border bg-surface/60 rounded-lg border px-4 py-3 text-sm">
            <p className="text-foreground font-medium">Demo login</p>
            <p className="text-muted-foreground mt-1 font-mono text-xs sm:text-sm">
              admin@vaultforge.dev · Password123! &nbsp;·&nbsp;
              aria@vaultforge.dev · Password123!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
