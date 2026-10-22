import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";
import { requirePageSession } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Activity",
};

export const instant = false;

function formatMetadata(type: string, metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return type;
  }
  const data = metadata as Record<string, unknown>;
  if (type === "ACHIEVEMENT_UNLOCK") {
    return `Unlocked ${String(data.title ?? data.code ?? "achievement")}`;
  }
  if (type.startsWith("LIBRARY_")) {
    return `${type.replace("LIBRARY_", "").toLowerCase()} ${String(data.gameTitle ?? data.gameSlug ?? "a game")}${
      data.status ? ` · ${String(data.status)}` : ""
    }`;
  }
  return type;
}

export default async function ActivityPage() {
  const session = await requirePageSession("/activity");

  const activities = await prisma.activity.findMany({
    where: {
      OR: [
        { actorId: session.user.id },
        { actor: { profile: { isPublic: true } } },
      ],
    },
    include: {
      actor: {
        select: {
          profile: { select: { username: true, displayName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Recent forge actions from you and public profiles."
      />

      {activities.length === 0 ? (
        <EmptyState
          title="Feed is quiet"
          description="Add games to your library to generate activity."
        />
      ) : (
        <ul className="space-y-3">
          {activities.map((item) => {
            const username = item.actor.profile?.username;
            return (
              <li
                key={item.id}
                className="border-border bg-card rounded-[10px] border px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm">
                    {username ? (
                      <Link
                        href={`/u/${username}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {item.actor.profile?.displayName ?? username}
                      </Link>
                    ) : (
                      <span className="font-medium">Unknown</span>
                    )}{" "}
                    <span className="text-muted-foreground">
                      {formatMetadata(item.type, item.metadata)}
                    </span>
                  </p>
                  <time
                    className="text-muted-foreground font-mono text-xs"
                    dateTime={item.createdAt.toISOString()}
                  >
                    {item.createdAt
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " ")}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
