import { z } from "zod";

import { achievementCriteriaSchema } from "@/lib/achievements/criteria";

export const achievementCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9_]+$/, "Use A-Z, 0-9, and underscores"),
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(3).max(240),
  xpReward: z.coerce.number().int().min(0).max(5000),
  icon: z.string().trim().max(40).optional(),
  criteria: achievementCriteriaSchema,
});

export const achievementUpdateSchema = achievementCreateSchema.partial();
