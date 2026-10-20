import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireApiSession } from "@/lib/rbac";
import { profileUpdateSchema } from "@/lib/validations/profile";

export async function PATCH(request: Request) {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return error;
  }

  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid profile payload", {
        issues: parsed.error.flatten(),
      });
    }

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: parsed.data,
    });

    return jsonOk({
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      xp: profile.xp,
      isPublic: profile.isPublic,
    });
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to update profile");
  }
}
