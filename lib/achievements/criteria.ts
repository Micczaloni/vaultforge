import { z } from "zod";

export const achievementCriteriaSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("library_count"),
    min: z.number().int().positive(),
  }),
  z.object({
    type: z.literal("status_count"),
    status: z.enum(["PLAYING", "COMPLETED", "BACKLOG", "WISHLIST", "PLAYED"]),
    min: z.number().int().positive(),
  }),
  z.object({
    type: z.literal("favorite_count"),
    min: z.number().int().positive(),
  }),
  z.object({
    type: z.literal("xp"),
    min: z.number().int().positive(),
  }),
]);

export type AchievementCriteria = z.infer<typeof achievementCriteriaSchema>;

export function parseCriteria(value: unknown): AchievementCriteria | null {
  const parsed = achievementCriteriaSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
