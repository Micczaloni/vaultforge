import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireApiSession } from "@/lib/rbac";
import { paginationSchema } from "@/lib/validations/games";

export async function GET(request: Request) {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid feed query", {
        issues: parsed.error.flatten(),
      });
    }

    const where = {
      OR: [
        { actorId: session.user.id },
        { actor: { profile: { isPublic: true } } },
      ],
    };

    const [total, activities] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.findMany({
        where,
        include: {
          actor: {
            select: {
              profile: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
      }),
    ]);

    return jsonOk(
      activities.map((item) => ({
        id: item.id,
        type: item.type,
        metadata: item.metadata,
        createdAt: item.createdAt,
        actor: {
          username: item.actor.profile?.username ?? "unknown",
          displayName: item.actor.profile?.displayName ?? null,
          avatarUrl: item.actor.profile?.avatarUrl ?? null,
        },
      })),
      {
        meta: {
          page: parsed.data.page,
          pageSize: parsed.data.pageSize,
          total,
        },
      },
    );
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load feed");
  }
}
