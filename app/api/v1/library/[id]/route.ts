import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { logLibraryActivity } from "@/lib/library/activity";
import { requireApiSession } from "@/lib/rbac";
import { libraryUpdateSchema } from "@/lib/validations/library";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return error;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = libraryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid update payload", {
        issues: parsed.error.flatten(),
      });
    }

    const existing = await prisma.userGame.findUnique({
      where: { id },
      include: { game: { select: { slug: true, title: true } } },
    });

    if (!existing) {
      return jsonError(404, "NOT_FOUND", "Library entry not found");
    }

    if (existing.userId !== session.user.id) {
      return jsonError(403, "FORBIDDEN", "You do not own this library entry");
    }

    const entry = await prisma.userGame.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.status && parsed.data.status !== existing.status
          ? { statusChangedAt: new Date() }
          : {}),
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

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logLibraryActivity({
        actorId: session.user.id,
        type: "LIBRARY_STATUS",
        metadata: {
          gameSlug: existing.game.slug,
          gameTitle: existing.game.title,
          status: parsed.data.status,
        },
      });
    }

    return jsonOk(entry);
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to update library entry");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return error;
  }

  try {
    const { id } = await context.params;
    const existing = await prisma.userGame.findUnique({
      where: { id },
      include: { game: { select: { slug: true, title: true } } },
    });

    if (!existing) {
      return jsonError(404, "NOT_FOUND", "Library entry not found");
    }

    if (existing.userId !== session.user.id) {
      return jsonError(403, "FORBIDDEN", "You do not own this library entry");
    }

    await prisma.userGame.delete({ where: { id } });

    await logLibraryActivity({
      actorId: session.user.id,
      type: "LIBRARY_REMOVE",
      metadata: {
        gameSlug: existing.game.slug,
        gameTitle: existing.game.title,
      },
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to delete library entry");
  }
}
