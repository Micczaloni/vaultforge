import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Admin",
};

export const instant = false;

export default async function AdminDashboardPage() {
  const [users, games, libraryEntries, achievements, activities] =
    await Promise.all([
      prisma.user.count(),
      prisma.game.count(),
      prisma.userGame.count(),
      prisma.achievement.count(),
      prisma.activity.count(),
    ]);

  const stats = [
    { label: "Users", value: users },
    { label: "Games", value: games },
    { label: "Library rows", value: libraryEntries },
    { label: "Achievements", value: achievements },
    { label: "Activities", value: activities },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="System overview for Vaultforge operators."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="border-border bg-surface rounded-[10px] border p-4"
          >
            <p className="text-muted-foreground text-xs">{item.label}</p>
            <p className="font-mono text-2xl">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
