import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { LibraryAddForm } from "@/components/library/library-add-form";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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

  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      genres: { include: { genre: true } },
      platforms: { include: { platform: true } },
    },
  });

  if (!game) {
    notFound();
  }

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
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="border-border bg-surface-elevated relative aspect-[3/4] overflow-hidden rounded-[10px] border">
          {game.coverUrl ? (
            <Image
              src={game.coverUrl}
              alt=""
              fill
              className="object-cover"
              sizes="220px"
              priority
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center font-mono text-xs">
              No cover
            </div>
          )}
        </div>

        <div className="space-y-6">
          <PageHeader
            title={game.title}
            description={game.description ?? undefined}
          />

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
            <div>
              <dt className="text-muted-foreground">Rating</dt>
              <dd>{game.rating ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Release</dt>
              <dd>
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
  );
}
