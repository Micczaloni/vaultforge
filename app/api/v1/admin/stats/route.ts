import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireApiAdmin } from "@/lib/rbac";

export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) {
    return error;
  }

  try {
    const [users, games, libraryEntries, achievements, activities] =
      await Promise.all([
        prisma.user.count(),
        prisma.game.count(),
        prisma.userGame.count(),
        prisma.achievement.count(),
        prisma.activity.count(),
      ]);

    return jsonOk({
      users,
      games,
      libraryEntries,
      achievements,
      activities,
    });
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load admin stats");
  }
}
