/**
 * Abstraction over an external game catalog (RAWG today, swappable later).
 * Route Handlers and Server Components must depend on this interface only.
 */
export type CatalogGame = {
  externalId: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  releaseDate: string | null;
  rating: number | null;
  description?: string | null;
  genres?: string[];
  platforms?: string[];
  screenshots?: string[];
};

export type CatalogSearchOpts = {
  page?: number;
  pageSize?: number;
};

export type CatalogListOpts = CatalogSearchOpts & {
  genre?: string;
  platform?: string;
  sort?: "title" | "releaseDate" | "rating";
  order?: "asc" | "desc";
};

export type PagedCatalog<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export interface GameCatalogService {
  search(
    query: string,
    opts?: CatalogSearchOpts,
  ): Promise<PagedCatalog<CatalogGame>>;
  getByExternalId(id: string): Promise<CatalogGame | null>;
  list(opts?: CatalogListOpts): Promise<PagedCatalog<CatalogGame>>;
}
