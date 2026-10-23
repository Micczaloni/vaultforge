import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Admin · Stats",
};

export const instant = false;

export default async function AdminStatsPage() {
  const [byRole, byStatus, topProfiles] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.userGame.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.profile.findMany({
      orderBy: { xp: "desc" },
      take: 5,
      select: { username: true, xp: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="System stats"
        description="Aggregates useful for moderation and health checks."
      />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Users by role</h2>
        <ul className="space-y-1 font-mono text-sm">
          {byRole.map((row) => (
            <li key={row.role}>
              {row.role}: {row._count._all}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Library by status</h2>
        <ul className="space-y-1 font-mono text-sm">
          {byStatus.map((row) => (
            <li key={row.status}>
              {row.status}: {row._count._all}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Top XP</h2>
        <ul className="space-y-1 font-mono text-sm">
          {topProfiles.map((row) => (
            <li key={row.username}>
              @{row.username}: {row.xp}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
