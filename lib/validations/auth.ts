import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().trim().email(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/, "Username may only contain a-z, 0-9, and _"),
  displayName: z.string().trim().min(1).max(80).optional(),
  password: passwordSchema,
});
