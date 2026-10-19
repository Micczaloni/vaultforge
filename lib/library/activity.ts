import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function logLibraryActivity(input: {
  actorId: string;
  type: "LIBRARY_ADD" | "LIBRARY_STATUS" | "LIBRARY_REMOVE";
  metadata: Prisma.InputJsonValue;
}) {
  await prisma.activity.create({
    data: {
      actorId: input.actorId,
      type: input.type,
      metadata: input.metadata,
    },
  });
}
