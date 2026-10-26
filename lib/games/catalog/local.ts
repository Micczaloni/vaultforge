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

const includeTaxonomy = {
  genres: { include: { genre: true } },
  platforms: { include: { platform: true } },
} as const;

/**
 * Local Game table catalog (used when RAWG_API_KEY is missing).
 * SQLite-friendly filters (no case-insensitive mode).
 */
export class LocalGameCatalog implements GameCatalogService {
  async search(
    query: string,
    opts: CatalogSearchOpts = {},
  ): Promise<PagedCatalog<CatalogGame>> {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 20;
    const normalized = query.trim().toLowerCase();

    const games = await prisma.game.findMany({
      include: includeTaxonomy,
      orderBy: { title: "asc" },
    });

    const filtered = games.filter((game) =>
      game.title.toLowerCase().includes(normalized),
    );
    const total = filtered.length;
    const items = filtered
      .slice((page - 1) * pageSize, page * pageSize)
      .map(toCatalogGame);

    return { items, page, pageSize, total };
  }

  async getByExternalId(id: string): Promise<CatalogGame | null> {
    const game = await prisma.game.findUnique({
      where: { externalId: id },
      include: includeTaxonomy,
    });
    return game ? toCatalogGame(game) : null;
  }

  async list(opts: CatalogListOpts = {}): Promise<PagedCatalog<CatalogGame>> {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 20;
    const order = opts.order ?? "desc";

    const games = await prisma.game.findMany({
      include: includeTaxonomy,
      orderBy:
        opts.sort === "title"
          ? { title: order }
          : opts.sort === "releaseDate"
            ? { releaseDate: order }
            : { rating: order },
    });

    const genre = opts.genre?.toLowerCase();
    const platform = opts.platform?.toLowerCase();

    const filtered = games.filter((game) => {
      const genreOk = genre
        ? game.genres.some((g) => g.genre.name.toLowerCase() === genre)
        : true;
      const platformOk = platform
        ? game.platforms.some((p) => p.platform.name.toLowerCase() === platform)
        : true;
      return genreOk && platformOk;
    });

    const total = filtered.length;
    const items = filtered
      .slice((page - 1) * pageSize, page * pageSize)
      .map(toCatalogGame);

    return { items, page, pageSize, total };
  }
}
