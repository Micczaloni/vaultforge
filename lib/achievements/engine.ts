import type { Prisma } from "@prisma/client";

import { parseCriteria } from "@/lib/achievements/criteria";
import { prisma } from "@/lib/db/prisma";

type Snapshot = {
  libraryCount: number;
  statusCounts: Record<string, number>;
  favoriteCount: number;
  xp: number;
};

async function loadSnapshot(userId: string): Promise<Snapshot> {
  const [libraryCount, grouped, favoriteCount, profile] = await Promise.all([
    prisma.userGame.count({ where: { userId } }),
    prisma.userGame.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.userGame.count({ where: { userId, favorited: true } }),
    prisma.profile.findUnique({
      where: { userId },
      select: { xp: true },
    }),
  ]);

  return {
    libraryCount,
    statusCounts: Object.fromEntries(
      grouped.map((row) => [row.status, row._count._all]),
    ),
    favoriteCount,
    xp: profile?.xp ?? 0,
  };
}

function progressFor(
  criteria: NonNullable<ReturnType<typeof parseCriteria>>,
  snapshot: Snapshot,
) {
  switch (criteria.type) {
    case "library_count":
      return Math.min(1, snapshot.libraryCount / criteria.min);
    case "status_count":
      return Math.min(
        1,
        (snapshot.statusCounts[criteria.status] ?? 0) / criteria.min,
      );
    case "favorite_count":
      return Math.min(1, snapshot.favoriteCount / criteria.min);
    case "xp":
      return Math.min(1, snapshot.xp / criteria.min);
    default:
      return 0;
  }
}

/**
 * Re-evaluate all platform achievements for a user after library/XP changes.
 * Idempotent unlocks; awards XP once when unlocked.
 */
export async function evaluateAchievementsForUser(userId: string) {
  const [achievements, snapshot, existing] = await Promise.all([
    prisma.achievement.findMany(),
    loadSnapshot(userId),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);

  const existingByAchievement = new Map(
    existing.map((row) => [row.achievementId, row]),
  );

  const unlockedNow: string[] = [];

  for (const achievement of achievements) {
    const criteria = parseCriteria(achievement.criteria);
    if (!criteria) {
      continue;
    }

    const progress = progressFor(criteria, snapshot);
    const current = existingByAchievement.get(achievement.id);

    if (current?.unlockedAt) {
      if (current.progress !== progress) {
        await prisma.userAchievement.update({
          where: { id: current.id },
          data: { progress },
        });
      }
      continue;
    }

    if (progress >= 1) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        create: {
          userId,
          achievementId: achievement.id,
          progress: 1,
          unlockedAt: new Date(),
        },
        update: {
          progress: 1,
          unlockedAt: new Date(),
        },
      });

      if (achievement.xpReward > 0) {
        await prisma.profile.update({
          where: { userId },
          data: { xp: { increment: achievement.xpReward } },
        });
      }

      await prisma.activity.create({
        data: {
          actorId: userId,
          type: "ACHIEVEMENT_UNLOCK",
          metadata: {
            code: achievement.code,
            title: achievement.title,
            xpReward: achievement.xpReward,
          } satisfies Prisma.InputJsonValue,
        },
      });

      unlockedNow.push(achievement.code);
      continue;
    }

    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress,
      },
      update: { progress },
    });
  }

  return unlockedNow;
}
