import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { paginationSchema } from "@/lib/validations/games";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid leaderboard query", {
        issues: parsed.error.flatten(),
      });
    }

    const where = { isPublic: true };
    const [total, profiles] = await Promise.all([
      prisma.profile.count({ where }),
      prisma.profile.findMany({
        where,
        orderBy: [{ xp: "desc" }, { username: "asc" }],
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
          xp: true,
        },
      }),
    ]);

    const offset = (parsed.data.page - 1) * parsed.data.pageSize;

    return jsonOk(
      profiles.map((profile, index) => ({
        rank: offset + index + 1,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        xp: profile.xp,
      })),
      {
        meta: {
          page: parsed.data.page,
          pageSize: parsed.data.pageSize,
          total,
        },
      },
    );
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load leaderboard");
  }
}
