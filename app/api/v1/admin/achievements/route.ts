import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireApiAdmin } from "@/lib/rbac";
import { achievementCreateSchema } from "@/lib/validations/admin";

export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) {
    return error;
  }

  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(achievements);
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to list achievements");
  }
}

export async function POST(request: Request) {
  const { error } = await requireApiAdmin();
  if (error) {
    return error;
  }

  try {
    const body = await request.json();
    const parsed = achievementCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid achievement payload", {
        issues: parsed.error.flatten(),
      });
    }

    const achievement = await prisma.achievement.create({
      data: {
        code: parsed.data.code,
        title: parsed.data.title,
        description: parsed.data.description,
        xpReward: parsed.data.xpReward,
        icon: parsed.data.icon,
        criteria: parsed.data.criteria,
      },
    });

    return jsonOk(achievement, { status: 201 });
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to create achievement");
  }
}
