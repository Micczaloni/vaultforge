import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireApiAdmin } from "@/lib/rbac";
import { paginationSchema } from "@/lib/validations/games";

export async function GET(request: Request) {
  const { error } = await requireApiAdmin();
  if (error) {
    return error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid users query", {
        issues: parsed.error.flatten(),
      });
    }

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              username: true,
              displayName: true,
              xp: true,
              isPublic: true,
            },
          },
        },
      }),
    ]);

    return jsonOk(users, {
      meta: {
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
        total,
      },
    });
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to list users");
  }
}
