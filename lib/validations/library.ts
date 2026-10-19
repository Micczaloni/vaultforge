import { LibraryStatus } from "@prisma/client";
import { z } from "zod";

import { paginationSchema } from "@/lib/validations/games";

export const libraryStatusSchema = z.nativeEnum(LibraryStatus);

export const libraryCreateSchema = z.object({
  gameId: z.string().min(1),
  status: libraryStatusSchema,
  rating: z.coerce.number().int().min(1).max(10).optional(),
  notes: z.string().trim().max(2000).optional(),
  favorited: z.boolean().optional(),
});

export const libraryUpdateSchema = z.object({
  status: libraryStatusSchema.optional(),
  rating: z.coerce.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  favorited: z.boolean().optional(),
});

export const libraryListSchema = paginationSchema.extend({
  status: libraryStatusSchema.optional(),
});
