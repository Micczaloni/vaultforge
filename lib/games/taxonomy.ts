import { prisma } from "@/lib/db/prisma";

export async function getTaxonomyOptions() {
  try {
    const [genres, platforms] = await Promise.all([
      prisma.genre.findMany({
        orderBy: { name: "asc" },
        select: { name: true },
      }),
      prisma.platform.findMany({
        orderBy: { name: "asc" },
        select: { name: true },
      }),
    ]);
    return {
      genres: genres.map((g) => g.name),
      platforms: platforms.map((p) => p.name),
    };
  } catch {
    return { genres: [] as string[], platforms: [] as string[] };
  }
}
