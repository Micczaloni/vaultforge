import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { DiscoveryFilters } from "@/components/games/discovery-filters";
import { GameCard } from "@/components/games/game-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { getGameCatalog } from "@/lib/games/catalog";
import type { CatalogGame } from "@/lib/games/catalog/types";
import { getTaxonomyOptions } from "@/lib/games/taxonomy";

export const metadata: Metadata = {
  title: "Discover games",
  description: "Browse, filter, and search the Vaultforge game catalog.",
};

function buildHref(params: Record<string, string | undefined>, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  query.set("page", String(page));
  return `/games?${query.toString()}`;
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    genre?: string;
    platform?: string;
    sort?: string;
    order?: string;
  }>;
}) {
  await connection();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const genre = params.genre?.trim() ?? "";
  const platform = params.platform?.trim() ?? "";
  const sort = params.sort ?? "rating";
  const order = params.order === "asc" ? "asc" : "desc";
  const page = Number(params.page ?? "1") || 1;
  const pageSize = 20;

  const taxonomy = await getTaxonomyOptions();

  let items: CatalogGame[] = [];
  let total = 0;

  try {
    const catalog = getGameCatalog();
    const result = q
      ? await catalog.search(q, { page, pageSize })
      : await catalog.list({
          page,
          pageSize,
          genre: genre || undefined,
          platform: platform || undefined,
          sort: sort as "title" | "releaseDate" | "rating",
          order,
        });
    items = result.items;
    total = result.total;
  } catch (error) {
    console.error("Discover catalog unavailable:", error);
  }

  const filterParams = {
    q: q || undefined,
    genre: genre || undefined,
    platform: platform || undefined,
    sort,
    order,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
      <PageHeader
        title="Discover"
        description={
          process.env.RAWG_API_KEY
            ? "Live catalog via RAWG (cached locally for your library)."
            : "Showing the local catalog cache. Add RAWG_API_KEY for live discovery."
        }
      />

      <DiscoveryFilters
        q={q}
        genre={genre}
        platform={platform}
        sort={sort}
        order={order}
        genres={taxonomy.genres}
        platforms={taxonomy.platforms}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No games found"
          description={
            q || genre || platform
              ? "Nothing matched these filters. Try clearing them or seeding the database."
              : "Seed the database or configure RAWG_API_KEY to populate discovery."
          }
          action={
            <Button variant="outline" asChild>
              <Link href="/games">Reset filters</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((game) => (
              <GameCard
                key={game.externalId}
                slug={game.slug}
                title={game.title}
                coverUrl={game.coverUrl}
                meta={
                  game.rating != null
                    ? `★ ${game.rating.toFixed(1)}`
                    : (game.releaseDate ?? undefined)
                }
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            hrefForPage={(nextPage) => buildHref(filterParams, nextPage)}
          />
        </>
      )}
    </div>
  );
}
