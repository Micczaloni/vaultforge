import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
    };
  } catch {
    return { title: "Game" };
  }
}

export default async function GameDetailsPage({ params }: PageProps) {
  await connection();
  const { slug } = await params;
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6">
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
    </div>
  );
}
