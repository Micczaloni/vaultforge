import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/games",
    "/leaderboard",
    "/about",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/games" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const games = await prisma.game.findMany({
      select: { slug: true, updatedAt: true },
      take: 500,
      orderBy: { updatedAt: "desc" },
    });

    const gameRoutes = games.map((game) => ({
      url: `${base}/games/${game.slug}`,
      lastModified: game.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...gameRoutes];
  } catch {
    return staticRoutes;
  }
}
