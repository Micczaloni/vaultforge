import { LocalGameCatalog } from "@/lib/games/catalog/local";
import { RawgGameCatalog } from "@/lib/games/catalog/rawg";
import type { GameCatalogService } from "@/lib/games/catalog/types";

/**
 * Resolve the active catalog provider.
 * Prefer RAWG when configured; otherwise fall back to the local Game table.
 */
export function getGameCatalog(): GameCatalogService {
  if (process.env.RAWG_API_KEY) {
    return new RawgGameCatalog();
  }
  return new LocalGameCatalog();
}

export type {
  CatalogGame,
  GameCatalogService,
} from "@/lib/games/catalog/types";
