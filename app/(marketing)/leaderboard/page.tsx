import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { EmptyState } from "@/components/shared/empty-state";
import { PageBackdrop } from "@/components/shared/page-backdrop";
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
    <div className="relative mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <PageBackdrop />
      <PageHeader
        eyebrow="Rankings"
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
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/10 ${
                  row.rank <= 3
                    ? "border-cyan-300/40 bg-gradient-to-r from-cyan-400/15 via-white/5 to-orange-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-8 place-items-center rounded-full font-mono text-sm ${
                      row.rank === 1
                        ? "bg-amber-300 text-slate-900"
                        : row.rank === 2
                          ? "bg-slate-200 text-slate-900"
                          : row.rank === 3
                            ? "bg-orange-400 text-slate-900"
                            : "text-muted-foreground bg-white/5"
                    }`}
                  >
                    {row.rank}
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
