import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { logLibraryActivity } from "@/lib/library/activity";
import { requireApiSession } from "@/lib/rbac";
import {
  libraryCreateSchema,
  libraryListSchema,
} from "@/lib/validations/library";

export async function GET(request: Request) {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = libraryListSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid library query", {
        issues: parsed.error.flatten(),
      });
    }

    const where = {
      userId: session.user.id,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    };

    const [total, entries] = await Promise.all([
      prisma.userGame.count({ where }),
      prisma.userGame.findMany({
        where,
        include: {
          game: {
            select: {
              id: true,
              slug: true,
              title: true,
              coverUrl: true,
              releaseDate: true,
              rating: true,
            },
          },
        },
        orderBy: { statusChangedAt: "desc" },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
      }),
    ]);

    return jsonOk(entries, {
      meta: {
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
        total,
      },
    });
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load library");
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return error;
  }

  try {
    const body = await request.json();
    const parsed = libraryCreateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid library payload", {
        issues: parsed.error.flatten(),
      });
    }

    const game = await prisma.game.findUnique({
      where: { id: parsed.data.gameId },
      select: { id: true, slug: true, title: true },
    });

    if (!game) {
      return jsonError(404, "NOT_FOUND", "Game not found");
    }

    const existing = await prisma.userGame.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: game.id,
        },
      },
    });

    if (existing) {
      return jsonError(409, "CONFLICT", "Game already in library");
    }

    const entry = await prisma.userGame.create({
      data: {
        userId: session.user.id,
        gameId: game.id,
        status: parsed.data.status,
        rating: parsed.data.rating,
        notes: parsed.data.notes,
        favorited: parsed.data.favorited ?? false,
      },
      include: {
        game: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
            releaseDate: true,
            rating: true,
          },
        },
      },
    });

    await logLibraryActivity({
      actorId: session.user.id,
      type: "LIBRARY_ADD",
      metadata: {
        gameSlug: game.slug,
        gameTitle: game.title,
        status: entry.status,
      },
    });

    return jsonOk(entry, { status: 201 });
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to add library entry");
  }
}
