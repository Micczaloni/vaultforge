import type { CatalogGame } from "@/lib/games/catalog/types";

type RawgGame = {
  id: number;
  slug: string;
  name: string;
  description_raw?: string;
  background_image?: string | null;
  released?: string | null;
  rating?: number | null;
  genres?: Array<{ name: string }>;
  platforms?: Array<{ platform: { name: string } }>;
  short_screenshots?: Array<{ image: string }>;
};

export function mapRawgGame(game: RawgGame): CatalogGame {
  return {
    externalId: String(game.id),
    slug: game.slug,
    title: game.name,
    coverUrl: game.background_image ?? null,
    releaseDate: game.released ?? null,
    rating: game.rating ?? null,
    description: game.description_raw ?? null,
    genres: game.genres?.map((g) => g.name) ?? [],
    platforms: game.platforms?.map((p) => p.platform.name) ?? [],
    screenshots:
      game.short_screenshots
        ?.map((s) => s.image)
        .filter((image) => Boolean(image)) ?? [],
  };
}
