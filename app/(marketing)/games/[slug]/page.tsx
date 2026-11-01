import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { LibraryAddForm } from "@/components/library/library-add-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { demoCoverUrl } from "@/lib/games/covers";
import { resolveGameBySlug } from "@/lib/games/resolve";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const game = await prisma.game.findUnique({ where: { slug } });
    if (!game) {
      return { title: "Game not found" };
    }
    return {
      title: game.title,
      description:
        game.description ?? `Details for ${game.title} on Vaultforge.`,
      openGraph: {
        title: game.title,
        description:
          game.description ?? `Track ${game.title} in your Vaultforge library.`,
        images: game.coverUrl ? [{ url: game.coverUrl }] : undefined,
      },
    };
  } catch {
    return { title: "Game" };
  }
}

export default async function GameDetailsPage({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  const session = await auth();

  const game = await resolveGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const cover = game.coverUrl || demoCoverUrl(game.slug);

  const libraryEntry = session?.user?.id
    ? await prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId: session.user.id,
            gameId: game.id,
          },
        },
      })
    : null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
        <Image
          src={cover}
          alt=""
          fill
          className="scale-110 object-cover opacity-30 blur-2xl"
          sizes="100vw"
          priority
        />
        <div className="from-background via-background/80 to-background absolute inset-0 bg-gradient-to-b" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6">
        <div className="grid items-start gap-8 md:grid-cols-[240px_1fr]">
          <div className="border-border/80 bg-surface-elevated relative aspect-[3/4] overflow-hidden rounded-xl border shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <Image
              src={cover}
              alt=""
              fill
              className="object-cover"
              sizes="240px"
              priority
            />
          </div>

          <div className="space-y-6 pt-1">
            <div className="space-y-3">
              <p className="text-accent font-mono text-xs tracking-[0.2em] uppercase">
                Game detail
              </p>
              <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                {game.title}
              </h1>
              {game.description ? (
                <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                  {game.description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {game.genres.map((item) => (
                <Badge key={item.genreId} variant="secondary">
                  {item.genre.name}
                </Badge>
              ))}
              {game.platforms.map((item) => (
                <Badge key={item.platformId} variant="outline">
                  {item.platform.name}
                </Badge>
              ))}
            </div>

            <dl className="grid gap-4 font-mono text-sm sm:grid-cols-2">
              <div className="border-border/60 bg-surface/50 rounded-lg border px-4 py-3">
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                  Rating
                </dt>
                <dd className="text-accent mt-1 text-lg">
                  {game.rating != null ? `★ ${game.rating.toFixed(1)}` : "—"}
                </dd>
              </div>
              <div className="border-border/60 bg-surface/50 rounded-lg border px-4 py-3">
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                  Release
                </dt>
                <dd className="mt-1 text-lg">
                  {game.releaseDate
                    ? game.releaseDate.toISOString().slice(0, 10)
                    : "—"}
                </dd>
              </div>
            </dl>

            {session?.user ? (
              <LibraryAddForm
                gameId={game.id}
                existing={
                  libraryEntry
                    ? {
                        id: libraryEntry.id,
                        status: libraryEntry.status,
                        favorited: libraryEntry.favorited,
                        rating: libraryEntry.rating,
                      }
                    : null
                }
              />
            ) : (
              <Button asChild>
                <Link href={`/login?callbackUrl=/games/${game.slug}`}>
                  Sign in to track this game
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
