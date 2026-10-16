import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const gameSearchSchema = paginationSchema.extend({
  q: z.string().trim().min(1).max(120),
});

export const gameListSchema = paginationSchema.extend({
  genre: z.string().trim().optional(),
  platform: z.string().trim().optional(),
  sort: z.enum(["title", "releaseDate", "rating"]).default("rating"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
