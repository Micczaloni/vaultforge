import { hash } from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        "Invalid registration payload",
        {
          issues: parsed.error.flatten(),
        },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const username = parsed.data.username.toLowerCase();

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return jsonError(409, "CONFLICT", "Email is already registered");
    }

    const existingUsername = await prisma.profile.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return jsonError(409, "CONFLICT", "Username is already taken");
    }

    const passwordHash = await hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.displayName ?? username,
        profile: {
          create: {
            username,
            displayName: parsed.data.displayName ?? username,
          },
        },
      },
      select: {
        id: true,
        email: true,
        profile: { select: { username: true } },
      },
    });

    return jsonOk(
      {
        id: user.id,
        email: user.email,
        username: user.profile?.username,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to register user");
  }
}
