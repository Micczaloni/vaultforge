import { prisma } from "@/lib/db/prisma";
import type {
  CatalogGame,
  CatalogListOpts,
  CatalogSearchOpts,
  GameCatalogService,
  PagedCatalog,
} from "@/lib/games/catalog/types";

function toCatalogGame(game: {
  externalId: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  releaseDate: Date | null;
  rating: number | null;
  description: string | null;
  genres?: { genre: { name: string } }[];
  platforms?: { platform: { name: string } }[];
}): CatalogGame {
  return {
    externalId: game.externalId,
    slug: game.slug,
    title: game.title,
    coverUrl: game.coverUrl,
    releaseDate: game.releaseDate
      ? game.releaseDate.toISOString().slice(0, 10)
      : null,
    rating: game.rating,
    description: game.description,
    genres: game.genres?.map((g) => g.genre.name) ?? [],
    platforms: game.platforms?.map((p) => p.platform.name) ?? [],
  };
}

/**
 * Fallback catalog when RAWG_API_KEY is missing — reads the local Game cache.
 * Keeps development usable offline after seeding.
 */
export class LocalGameCatalog implements GameCatalogService {
  async search(
    query: string,
    opts: CatalogSearchOpts = {},
  ): Promise<PagedCatalog<CatalogGame>> {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 20;
    const where = {
      title: { contains: query, mode: "insensitive" as const },
    };

    const [total, games] = await Promise.all([
      prisma.game.count({ where }),
      prisma.game.findMany({
        where,
        include: {
          genres: { include: { genre: true } },
          platforms: { include: { platform: true } },
        },
        orderBy: { title: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: games.map(toCatalogGame),
      page,
      pageSize,
      total,
    };
  }

  async getByExternalId(id: string): Promise<CatalogGame | null> {
    const game = await prisma.game.findUnique({
      where: { externalId: id },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
      },
    });
    return game ? toCatalogGame(game) : null;
  }

  async list(opts: CatalogListOpts = {}): Promise<PagedCatalog<CatalogGame>> {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 20;
    const order = opts.order ?? "desc";

    const [total, games] = await Promise.all([
      prisma.game.count(),
      prisma.game.findMany({
        include: {
          genres: { include: { genre: true } },
          platforms: { include: { platform: true } },
        },
        orderBy:
          opts.sort === "title"
            ? { title: order }
            : opts.sort === "releaseDate"
              ? { releaseDate: order }
              : { rating: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: games.map(toCatalogGame),
      page,
      pageSize,
      total,
    };
  }
}
