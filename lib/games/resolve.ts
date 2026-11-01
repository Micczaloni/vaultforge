import { prisma } from "@/lib/db/prisma";
import { getGameCatalog } from "@/lib/games/catalog";
import { syncCatalogGame } from "@/lib/games/sync";

const include = {
  genres: { include: { genre: true } },
  platforms: { include: { platform: true } },
} as const;

/**
 * Resolve a game by slug: local cache first, then the active catalog
 * (RAWG accepts slugs on /games/{id}) and persist it so library joins work.
 */
export async function resolveGameBySlug(slug: string) {
  const local = await prisma.game.findUnique({ where: { slug }, include });
  if (local) {
    return local;
  }

  if (!process.env.RAWG_API_KEY) {
    return null;
  }

  try {
    const remote = await getGameCatalog().getByExternalId(slug);
    if (!remote) {
      return null;
    }
    const record = await syncCatalogGame(remote);
    return prisma.game.findUnique({ where: { id: record.id }, include });
  } catch (error) {
    console.error("Catalog resolve failed:", error);
    return null;
  }
}
