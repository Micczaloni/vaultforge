import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireApiSession } from "@/lib/rbac";

export async function GET() {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return error;
  }

  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { title: "asc" },
      include: {
        users: {
          where: { userId: session.user.id },
          take: 1,
        },
      },
    });

    return jsonOk(
      achievements.map((item) => ({
        achievement: {
          id: item.id,
          code: item.code,
          title: item.title,
          description: item.description,
          xpReward: item.xpReward,
          icon: item.icon,
        },
        progress: item.users[0]?.progress ?? 0,
        unlockedAt: item.users[0]?.unlockedAt ?? null,
      })),
    );
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load user achievements");
  }
}
