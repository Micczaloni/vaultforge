import type { LibraryStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function getUserLibrary(userId: string, status?: LibraryStatus) {
  return prisma.userGame.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: {
      game: {
        select: {
          slug: true,
          title: true,
          coverUrl: true,
        },
      },
    },
    orderBy: { statusChangedAt: "desc" },
  });
}
