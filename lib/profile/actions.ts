"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { profileUpdateSchema } from "@/lib/validations/profile";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in required." };
  }

  const parsed = profileUpdateSchema.safeParse({
    displayName: String(formData.get("displayName") ?? "") || undefined,
    bio: String(formData.get("bio") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? "") || undefined,
    isPublic: formData.get("isPublic") === "on",
  });

  if (!parsed.success) {
    return { error: "Check your profile fields and try again." };
  }

  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      avatarUrl: parsed.data.avatarUrl,
      isPublic: parsed.data.isPublic ?? true,
    },
  });

  revalidatePath("/settings/profile");
  revalidatePath(`/u/${profile.username}`);
  return { success: "Profile updated." };
}
