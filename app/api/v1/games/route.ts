import { getGameCatalog } from "@/lib/games/catalog";
import { syncCatalogGame } from "@/lib/games/sync";
import { jsonError, jsonOk } from "@/lib/api/response";
import { gameListSchema } from "@/lib/validations/games";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = gameListSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      genre: searchParams.get("genre") ?? undefined,
      platform: searchParams.get("platform") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid query parameters", {
        issues: parsed.error.flatten(),
      });
    }

    const catalog = getGameCatalog();
    const result = await catalog.list(parsed.data);

    // Keep a warm local cache for library joins when RAWG is active.
    if (process.env.RAWG_API_KEY) {
      await Promise.allSettled(
        result.items.map((game) => syncCatalogGame(game)),
      );
    }

    return jsonOk(result.items, {
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to list games");
  }
}
