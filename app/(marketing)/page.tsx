import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

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
      take: 8,
      select: { slug: true, title: true, coverUrl: true, rating: true },
    });
  } catch {
    featured = [];
  }

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(34,211,238,0.08),_transparent_40%)]"
      />

      <section className="relative mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Gaming vault platform
          </p>
          <div className="space-y-4">
            <h1 className="text-foreground text-5xl font-semibold tracking-tight sm:text-6xl">
              Vaultforge
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg sm:text-xl">
              Your games. Your record. Your forge. Track play status, discover
              titles, unlock achievements, and climb the leaderboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/games">Browse games</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/register">Create account</Link>
            </Button>
          </div>
          <div className="border-border bg-surface/80 text-muted-foreground rounded-[10px] border p-4 text-sm">
            <p className="text-foreground font-medium">Demo login</p>
            <p className="mt-1 font-mono text-xs sm:text-sm">
              admin@vaultforge.dev · Password123!
            </p>
            <p className="mt-1 font-mono text-xs sm:text-sm">
              aria@vaultforge.dev · Password123!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {(featured.length > 0
            ? featured
            : Array.from({ length: 4 }).map((_, index) => ({
                slug: `demo-${index}`,
                title: "Vaultforge",
                coverUrl: demoCoverUrl(`demo-${index}`),
                rating: null,
              }))
          )
            .slice(0, 4)
            .map((game) => (
              <Link
                key={game.slug}
                href={featured.length ? `/games/${game.slug}` : "/games"}
                className="group border-border bg-surface relative aspect-[3/4] overflow-hidden rounded-[10px] border"
              >
                <Image
                  src={game.coverUrl || demoCoverUrl(game.slug)}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 45vw, 20vw"
                />
                <div className="from-background via-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-1 p-3">
                  <p className="text-foreground line-clamp-2 text-sm font-semibold">
                    {game.title}
                  </p>
                  {game.rating != null ? (
                    <p className="text-muted-foreground font-mono text-xs">
                      ★ {game.rating.toFixed(1)}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
