import { mapRawgGame } from "@/lib/games/catalog/mapper";
import type {
  CatalogGame,
  CatalogListOpts,
  CatalogSearchOpts,
  GameCatalogService,
  PagedCatalog,
} from "@/lib/games/catalog/types";

const RAWG_BASE = "https://api.rawg.io/api";

function requireApiKey() {
  const key = process.env.RAWG_API_KEY;
  if (!key) {
    throw new Error("RAWG_API_KEY is not configured");
  }
  return key;
}

async function rawgFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const key = requireApiKey();
  const url = new URL(`${RAWG_BASE}${path}`);
  url.searchParams.set("key", key);

  for (const [param, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(param, String(value));
    }
  }

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`RAWG request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

export class RawgGameCatalog implements GameCatalogService {
  async search(
    query: string,
    opts: CatalogSearchOpts = {},
  ): Promise<PagedCatalog<CatalogGame>> {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 20;

    const data = await rawgFetch<{
      count: number;
      results: Parameters<typeof mapRawgGame>[0][];
    }>("/games", {
      search: query,
      search_precise: "true",
      exclude_additions: "true",
      page,
      page_size: pageSize,
    });

    return {
      items: data.results.map(mapRawgGame),
      page,
      pageSize,
      total: data.count,
    };
  }

  async getByExternalId(id: string): Promise<CatalogGame | null> {
    try {
      const data = await rawgFetch<Parameters<typeof mapRawgGame>[0]>(
        `/games/${id}`,
      );
      return mapRawgGame(data);
    } catch {
      return null;
    }
  }

  async list(opts: CatalogListOpts = {}): Promise<PagedCatalog<CatalogGame>> {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 20;

    const ordering =
      opts.sort === "title"
        ? opts.order === "desc"
          ? "-name"
          : "name"
        : opts.sort === "releaseDate"
          ? opts.order === "asc"
            ? "released"
            : "-released"
          : opts.order === "asc"
            ? "rating"
            : "-rating";

    const data = await rawgFetch<{
      count: number;
      results: Parameters<typeof mapRawgGame>[0][];
    }>("/games", {
      page,
      page_size: pageSize,
      genres: opts.genre,
      platforms: opts.platform,
      ordering,
      // Keep the list "store quality": skip DLC/editions and obscure
      // titles that top RAWG's raw rating sort with a handful of votes.
      exclude_additions: "true",
      metacritic: opts.sort === "rating" || !opts.sort ? "70,100" : undefined,
    });

    return {
      items: data.results.map(mapRawgGame),
      page,
      pageSize,
      total: data.count,
    };
  }
}
