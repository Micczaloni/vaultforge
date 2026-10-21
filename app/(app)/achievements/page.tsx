import type { Metadata } from "next";
import { Lock, Trophy } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";
import { requirePageSession } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Achievements",
};

export const instant = false;

export default async function AchievementsPage() {
  const session = await requirePageSession("/achievements");

  const achievements = await prisma.achievement.findMany({
    orderBy: { xpReward: "desc" },
    include: {
      users: {
        where: { userId: session.user.id },
        take: 1,
      },
    },
  });

  const unlocked = achievements.filter((item) => item.users[0]?.unlockedAt);
  const completion =
    achievements.length === 0
      ? 0
      : Math.round((unlocked.length / achievements.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        description="Platform milestones unlocked by tracking your vault."
      />

      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="font-mono">
          {unlocked.length}/{achievements.length} unlocked
        </Badge>
        <Badge variant="outline" className="font-mono">
          {completion}% complete
        </Badge>
      </div>

      {achievements.length === 0 ? (
        <EmptyState
          title="No achievements configured"
          description="Seed the database or create achievements in admin."
          icon={<Trophy className="size-8" />}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {achievements.map((item) => {
            const progress = item.users[0]?.progress ?? 0;
            const isUnlocked = Boolean(item.users[0]?.unlockedAt);

            return (
              <li
                key={item.id}
                className="border-border bg-card rounded-[10px] border p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium">{item.title}</h2>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                  {isUnlocked ? (
                    <Trophy className="text-accent size-5" aria-hidden />
                  ) : (
                    <Lock
                      className="text-muted-foreground size-5"
                      aria-hidden
                    />
                  )}
                </div>
                <div className="bg-muted mb-2 h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <p className="text-muted-foreground font-mono text-xs">
                  {Math.round(progress * 100)}% · +{item.xpReward} XP
                  {isUnlocked ? " · unlocked" : " · locked"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
