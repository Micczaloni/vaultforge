import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

type PageProps = {
  params: Promise<{ username: string }>;
};

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  try {
    const profile = await prisma.profile.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (!profile || !profile.isPublic) {
      return { title: "Profile" };
    }
    return {
      title: `${profile.displayName ?? profile.username} · Vaultforge`,
      description: profile.bio ?? `Gaming profile for ${profile.username}.`,
    };
  } catch {
    return { title: "Profile" };
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  await connection();
  const { username } = await params;
  const session = await auth();

  const profile = await prisma.profile.findUnique({
    where: { username: username.toLowerCase() },
  });

  if (!profile) {
    notFound();
  }

  const isOwner = session?.user?.id === profile.userId;
  if (!profile.isPublic && !isOwner) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <PageHeader
          title="Private profile"
          description="This forge is set to private."
        />
      </div>
    );
  }

  const [library, unlocked, statusGroups] = await Promise.all([
    prisma.userGame.findMany({
      where: { userId: profile.userId },
      include: {
        game: { select: { slug: true, title: true } },
      },
      orderBy: { statusChangedAt: "desc" },
      take: 12,
    }),
    prisma.userAchievement.count({
      where: { userId: profile.userId, unlockedAt: { not: null } },
    }),
    prisma.userGame.groupBy({
      by: ["status"],
      where: { userId: profile.userId },
      _count: { _all: true },
    }),
  ]);

  const grouped = Object.fromEntries(
    statusGroups.map((row) => [row.status, row._count._all]),
  ) as Record<string, number>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
      <PageHeader
        title={profile.displayName ?? profile.username}
        description={profile.bio ?? undefined}
        actions={
          isOwner ? (
            <Link
              href="/settings/profile"
              className="text-primary text-sm hover:underline"
            >
              Edit profile
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="font-mono">
          @{profile.username}
        </Badge>
        <Badge variant="secondary" className="font-mono">
          {profile.xp} XP
        </Badge>
        <Badge variant="outline" className="font-mono">
          {unlocked} achievements
        </Badge>
      </div>

      <section className="space-y-3" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-lg font-semibold">
          Library snapshot
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            ["PLAYING", "COMPLETED", "BACKLOG", "WISHLIST", "PLAYED"] as const
          ).map((status) => (
            <div
              key={status}
              className="border-border bg-surface rounded-[10px] border p-3"
            >
              <StatusBadge status={status} />
              <p className="mt-2 font-mono text-2xl">{grouped[status] ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="text-lg font-semibold">
          Recent library
        </h2>
        {library.length === 0 ? (
          <p className="text-muted-foreground text-sm">No games tracked yet.</p>
        ) : (
          <ul className="space-y-2">
            {library.map((item) => (
              <li
                key={item.id}
                className="border-border flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              >
                <Link
                  href={`/games/${item.game.slug}`}
                  className="hover:text-primary"
                >
                  {item.game.title}
                </Link>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
