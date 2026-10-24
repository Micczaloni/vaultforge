import { getGameCatalog } from "@/lib/games/catalog";
import { syncCatalogGame } from "@/lib/games/sync";
import { rateLimit } from "@/lib/api/rate-limit";
import { jsonError, jsonOk } from "@/lib/api/response";
import { gameSearchSchema } from "@/lib/validations/games";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    const limited = rateLimit(`search:${ip}`, 40, 60_000);
    if (!limited.ok) {
      return jsonError(429, "RATE_LIMITED", "Too many search requests", {
        retryAfterSec: limited.retryAfterSec,
      });
    }

    const { searchParams } = new URL(request.url);
    const parsed = gameSearchSchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid search query", {
        issues: parsed.error.flatten(),
      });
    }

    const catalog = getGameCatalog();
    const result = await catalog.search(parsed.data.q, {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });

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
        q: parsed.data.q,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to search games");
  }
}
