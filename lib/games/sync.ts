import { prisma } from "@/lib/db/prisma";
import type { CatalogGame } from "@/lib/games/catalog/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureTaxonomy(
  names: string[],
  kind: "genre" | "platform",
): Promise<string[]> {
  const ids: string[] = [];

  for (const name of names) {
    const slug = slugify(name);
    if (kind === "genre") {
      const genre = await prisma.genre.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      ids.push(genre.id);
    } else {
      const platform = await prisma.platform.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      ids.push(platform.id);
    }
  }

  return ids;
}

/** Upsert a catalog game into the local cache for library joins. */
export async function syncCatalogGame(game: CatalogGame) {
  const releaseDate = game.releaseDate ? new Date(game.releaseDate) : null;

  const record = await prisma.game.upsert({
    where: { externalId: game.externalId },
    update: {
      slug: game.slug,
      title: game.title,
      description: game.description ?? null,
      coverUrl: game.coverUrl,
      releaseDate,
      rating: game.rating,
    },
    create: {
      externalId: game.externalId,
      slug: game.slug,
      title: game.title,
      description: game.description ?? null,
      coverUrl: game.coverUrl,
      releaseDate,
      rating: game.rating,
    },
  });

  if (game.genres?.length) {
    const genreIds = await ensureTaxonomy(game.genres, "genre");
    await prisma.gameGenre.deleteMany({ where: { gameId: record.id } });
    await prisma.gameGenre.createMany({
      data: genreIds.map((genreId) => ({ gameId: record.id, genreId })),
      skipDuplicates: true,
    });
  }

  if (game.platforms?.length) {
    const platformIds = await ensureTaxonomy(game.platforms, "platform");
    await prisma.gamePlatform.deleteMany({ where: { gameId: record.id } });
    await prisma.gamePlatform.createMany({
      data: platformIds.map((platformId) => ({
        gameId: record.id,
        platformId,
      })),
      skipDuplicates: true,
    });
  }

  return record;
}
