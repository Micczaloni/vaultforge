"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requirePageAdmin } from "@/lib/rbac";
import { achievementCreateSchema } from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  success?: string;
};

export async function createAchievementAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePageAdmin();

  const criteriaType = String(formData.get("criteriaType") ?? "");
  const criteriaMin = Number(formData.get("criteriaMin") ?? 1);
  const criteriaStatus = String(formData.get("criteriaStatus") ?? "COMPLETED");

  const criteria =
    criteriaType === "status_count"
      ? {
          type: "status_count" as const,
          status: criteriaStatus,
          min: criteriaMin,
        }
      : criteriaType === "favorite_count"
        ? { type: "favorite_count" as const, min: criteriaMin }
        : criteriaType === "xp"
          ? { type: "xp" as const, min: criteriaMin }
          : { type: "library_count" as const, min: criteriaMin };

  const parsed = achievementCreateSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    xpReward: formData.get("xpReward") ?? 0,
    criteria,
  });

  if (!parsed.success) {
    return { error: "Invalid achievement fields." };
  }

  try {
    await prisma.achievement.create({
      data: {
        code: parsed.data.code,
        title: parsed.data.title,
        description: parsed.data.description,
        xpReward: parsed.data.xpReward,
        criteria: parsed.data.criteria,
      },
    });
  } catch {
    return { error: "Could not create achievement (code may already exist)." };
  }

  revalidatePath("/admin/achievements");
  revalidatePath("/achievements");
  return { success: "Achievement created." };
}
