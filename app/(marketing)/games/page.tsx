import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { GameCard } from "@/components/games/game-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getGameCatalog } from "@/lib/games/catalog";
import type { CatalogGame } from "@/lib/games/catalog/types";

export const metadata: Metadata = {
  title: "Discover games",
  description: "Browse and search the Vaultforge game catalog.",
};

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Number(params.page ?? "1") || 1;

  let items: CatalogGame[] = [];
  try {
    const catalog = getGameCatalog();
    const result = q
      ? await catalog.search(q, { page, pageSize: 20 })
      : await catalog.list({
          page,
          pageSize: 20,
          sort: "rating",
          order: "desc",
        });
    items = result.items;
  } catch (error) {
    console.error("Discover catalog unavailable:", error);
  }

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

      <form className="flex flex-col gap-3 sm:flex-row" action="/games">
        <label className="sr-only" htmlFor="game-search">
          Search games
        </label>
        <input
          id="game-search"
          name="q"
          defaultValue={q}
          placeholder="Search titles…"
          className="border-input bg-background focus-visible:ring-ring/40 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
        />
        <Button type="submit">Search</Button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No games found"
          description={
            q
              ? `Nothing matched “${q}”. Try another query or seed the database.`
              : "Seed the database or configure RAWG_API_KEY to populate discovery."
          }
          action={
            <Button variant="outline" asChild>
              <Link href="/games">Clear search</Link>
            </Button>
          }
        />
      ) : (
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
      )}
    </div>
  );
}
