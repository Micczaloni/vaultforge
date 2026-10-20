import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ username: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { username } = await context.params;
    const session = await auth();

    const profile = await prisma.profile.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!profile) {
      return jsonError(404, "NOT_FOUND", "User not found");
    }

    const isOwner = session?.user?.id === profile.userId;
    if (!profile.isPublic && !isOwner) {
      return jsonError(403, "FORBIDDEN", "This profile is private");
    }

    const [grouped, achievementsUnlocked] = await Promise.all([
      prisma.userGame.groupBy({
        by: ["status"],
        where: { userId: profile.userId },
        _count: { _all: true },
      }),
      prisma.userAchievement.count({
        where: {
          userId: profile.userId,
          unlockedAt: { not: null },
        },
      }),
    ]);

    const counts = Object.fromEntries(
      grouped.map((row) => [row.status, row._count._all]),
    ) as Record<string, number>;

    return jsonOk({
      playing: counts.PLAYING ?? 0,
      completed: counts.COMPLETED ?? 0,
      backlog: counts.BACKLOG ?? 0,
      wishlist: counts.WISHLIST ?? 0,
      played: counts.PLAYED ?? 0,
      achievementsUnlocked,
      xp: profile.xp,
    });
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load stats");
  }
}
