import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api/response";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (!session) {
    return null;
  }
  if (role === "ADMIN" && session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function requirePageSession(callbackUrl = "/dashboard") {
  const session = await requireSession();
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

export async function requirePageAdmin() {
  const session = await requirePageSession("/admin");
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}

export async function requireApiSession() {
  const session = await requireSession();
  if (!session) {
    return {
      session: null,
      error: jsonError(401, "UNAUTHORIZED", "Sign in required"),
    };
  }
  return { session, error: null };
}

export async function requireApiAdmin() {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return {
      session: null,
      error: error ?? jsonError(401, "UNAUTHORIZED", "Sign in required"),
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      error: jsonError(403, "FORBIDDEN", "Admin role required"),
    };
  }
  return { session, error: null };
}
