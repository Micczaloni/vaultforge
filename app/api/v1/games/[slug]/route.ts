import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
      },
    });

    if (!game) {
      return jsonError(404, "NOT_FOUND", "Game not found");
    }

    return jsonOk({
      id: game.id,
      slug: game.slug,
      title: game.title,
      description: game.description,
      coverUrl: game.coverUrl,
      releaseDate: game.releaseDate,
      rating: game.rating,
      genres: game.genres.map((g) => g.genre.name),
      platforms: game.platforms.map((p) => p.platform.name),
    });
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load game");
  }
}
