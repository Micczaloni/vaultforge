import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "XP rankings across public Vaultforge profiles.",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const pageSize = 20;

  let total = 0;
  let rows: Array<{
    rank: number;
    username: string;
    displayName: string | null;
    xp: number;
  }> = [];

  try {
    const where = { isPublic: true };
    const [count, profiles] = await Promise.all([
      prisma.profile.count({ where }),
      prisma.profile.findMany({
        where,
        orderBy: [{ xp: "desc" }, { username: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          username: true,
          displayName: true,
          xp: true,
        },
      }),
    ]);
    total = count;
    rows = profiles.map((profile, index) => ({
      rank: (page - 1) * pageSize + index + 1,
      username: profile.username,
      displayName: profile.displayName,
      xp: profile.xp,
    }));
  } catch (error) {
    console.error("Leaderboard unavailable:", error);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <PageHeader
        title="Leaderboard"
        description="Public forges ranked by XP from achievements and play."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No ranked players yet"
          description="Seed the database or make profiles public to populate rankings."
        />
      ) : (
        <>
          <ol className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.username}
                className="border-border bg-card flex items-center justify-between gap-3 rounded-[10px] border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-8 font-mono text-sm">
                    #{row.rank}
                  </span>
                  <Link
                    href={`/u/${row.username}`}
                    className="hover:text-primary font-medium"
                  >
                    {row.displayName ?? row.username}
                  </Link>
                </div>
                <span className="text-accent font-mono text-sm">
                  {row.xp} XP
                </span>
              </li>
            ))}
          </ol>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            hrefForPage={(next) => `/leaderboard?page=${next}`}
          />
        </>
      )}
    </div>
  );
}
