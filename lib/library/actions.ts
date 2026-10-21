"use server";

import { revalidatePath } from "next/cache";

import { evaluateAchievementsForUser } from "@/lib/achievements/engine";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { logLibraryActivity } from "@/lib/library/activity";
import {
  libraryCreateSchema,
  libraryUpdateSchema,
} from "@/lib/validations/library";

export type LibraryActionState = {
  error?: string;
  success?: string;
};

export async function addToLibraryAction(
  _prev: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in required." };
  }

  const parsed = libraryCreateSchema.safeParse({
    gameId: String(formData.get("gameId") ?? ""),
    status: String(formData.get("status") ?? "BACKLOG"),
    rating: formData.get("rating") || undefined,
    favorited: formData.get("favorited") === "on",
  });

  if (!parsed.success) {
    return { error: "Invalid library details." };
  }

  const game = await prisma.game.findUnique({
    where: { id: parsed.data.gameId },
    select: { id: true, slug: true, title: true },
  });

  if (!game) {
    return { error: "Game not found." };
  }

  try {
    await prisma.userGame.create({
      data: {
        userId: session.user.id,
        gameId: game.id,
        status: parsed.data.status,
        rating: parsed.data.rating,
        favorited: parsed.data.favorited ?? false,
      },
    });

    await logLibraryActivity({
      actorId: session.user.id,
      type: "LIBRARY_ADD",
      metadata: {
        gameSlug: game.slug,
        gameTitle: game.title,
        status: parsed.data.status,
      },
    });

    await evaluateAchievementsForUser(session.user.id);
  } catch {
    return { error: "Game is already in your library." };
  }

  revalidatePath("/library");
  revalidatePath("/achievements");
  revalidatePath(`/games/${game.slug}`);
  revalidatePath("/dashboard");
  return { success: "Added to library." };
}

export async function updateLibraryAction(
  _prev: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in required." };
  }

  const id = String(formData.get("id") ?? "");
  const parsed = libraryUpdateSchema.safeParse({
    status: formData.get("status") || undefined,
    rating:
      formData.get("rating") === ""
        ? null
        : formData.get("rating") || undefined,
    favorited: formData.has("favorited")
      ? formData.get("favorited") === "on"
      : undefined,
  });

  if (!id || !parsed.success) {
    return { error: "Invalid update." };
  }

  const existing = await prisma.userGame.findUnique({
    where: { id },
    include: { game: { select: { slug: true, title: true } } },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { error: "Library entry not found." };
  }

  await prisma.userGame.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(parsed.data.status && parsed.data.status !== existing.status
        ? { statusChangedAt: new Date() }
        : {}),
    },
  });

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await logLibraryActivity({
      actorId: session.user.id,
      type: "LIBRARY_STATUS",
      metadata: {
        gameSlug: existing.game.slug,
        gameTitle: existing.game.title,
        status: parsed.data.status,
      },
    });
  }

  await evaluateAchievementsForUser(session.user.id);

  revalidatePath("/library");
  revalidatePath("/library/wishlist");
  revalidatePath("/library/backlog");
  revalidatePath("/achievements");
  revalidatePath(`/games/${existing.game.slug}`);
  return { success: "Library updated." };
}

/** Form-compatible wrapper (no useActionState). */
export async function updateLibraryFormAction(formData: FormData) {
  await updateLibraryAction({}, formData);
}

export async function removeFromLibraryAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  const existing = await prisma.userGame.findUnique({
    where: { id },
    include: { game: { select: { slug: true, title: true } } },
  });

  if (!existing || existing.userId !== session.user.id) {
    return;
  }

  await prisma.userGame.delete({ where: { id } });
  await logLibraryActivity({
    actorId: session.user.id,
    type: "LIBRARY_REMOVE",
    metadata: {
      gameSlug: existing.game.slug,
      gameTitle: existing.game.title,
    },
  });

  await evaluateAchievementsForUser(session.user.id);

  revalidatePath("/library");
  revalidatePath("/library/wishlist");
  revalidatePath("/library/backlog");
  revalidatePath("/achievements");
  revalidatePath(`/games/${existing.game.slug}`);
}
