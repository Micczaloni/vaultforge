import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/prisma";
import { requirePageSession } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const instant = false;

export default async function DashboardPage() {
  const session = await requirePageSession("/dashboard");

  const [profile, playing, recent, activities] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.userGame.findMany({
      where: { userId: session.user.id, status: "PLAYING" },
      include: { game: { select: { slug: true, title: true } } },
      take: 5,
      orderBy: { statusChangedAt: "desc" },
    }),
    prisma.userGame.findMany({
      where: { userId: session.user.id },
      include: { game: { select: { slug: true, title: true } } },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.activity.findMany({
      where: { actorId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back${profile?.displayName ? `, ${profile.displayName}` : ""}.`}
        actions={
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href="/games">Discover</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/library">Library</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-border bg-surface rounded-[10px] border p-4">
          <p className="text-muted-foreground text-xs">XP</p>
          <p className="font-mono text-2xl">{profile?.xp ?? 0}</p>
        </div>
        <div className="border-border bg-surface rounded-[10px] border p-4">
          <p className="text-muted-foreground text-xs">Currently playing</p>
          <p className="font-mono text-2xl">{playing.length}</p>
        </div>
        <div className="border-border bg-surface rounded-[10px] border p-4">
          <p className="text-muted-foreground text-xs">Role</p>
          <p className="font-mono text-2xl">{session.user.role}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Now playing</h2>
        {playing.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing marked as playing yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {playing.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/games/${item.game.slug}`}
                  className="hover:text-primary"
                >
                  {item.game.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent library updates</h2>
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No library activity yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3"
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your recent activity</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No activity logged yet.
          </p>
        ) : (
          <ul className="text-muted-foreground space-y-2 font-mono text-sm">
            {activities.map((item) => (
              <li key={item.id}>
                {item.type} · {item.createdAt.toISOString().slice(0, 10)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
