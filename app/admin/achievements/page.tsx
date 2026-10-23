import type { Metadata } from "next";

import { AchievementCreateForm } from "@/components/admin/achievement-create-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Admin · Achievements",
};

export const instant = false;

export default async function AdminAchievementsPage() {
  const achievements = await prisma.achievement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        description="Manage platform achievement definitions."
      />
      <AchievementCreateForm />
      <ul className="space-y-2">
        {achievements.map((item) => (
          <li
            key={item.id}
            className="border-border bg-card rounded-[10px] border px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">
                {item.title}{" "}
                <span className="text-muted-foreground font-mono text-xs">
                  {item.code}
                </span>
              </p>
              <span className="text-accent font-mono text-xs">
                +{item.xpReward} XP
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
