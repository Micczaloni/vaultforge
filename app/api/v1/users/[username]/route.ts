import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ username: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { username } = await context.params;
    const session = await auth();

    const profile = await prisma.profile.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        user: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return jsonError(404, "NOT_FOUND", "User not found");
    }

    const isOwner = session?.user?.id === profile.userId;
    if (!profile.isPublic && !isOwner) {
      return jsonError(403, "FORBIDDEN", "This profile is private");
    }

    return jsonOk({
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      xp: profile.xp,
      isPublic: profile.isPublic,
      createdAt: profile.user.createdAt,
    });
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load profile");
  }
}
