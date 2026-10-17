import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });

      if (!user?.passwordHash) {
        return null;
      }

      const valid = await compare(parsed.data.password, user.passwordHash);
      if (!valid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.unshift(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  events: {
    async createUser({ user }) {
      if (!user.id || !user.email) {
        return;
      }

      const base =
        user.name
          ?.toLowerCase()
          .replace(/[^a-z0-9_]+/g, "_")
          .slice(0, 20) ||
        user.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]+/g, "_");

      let username = base.slice(0, 24) || `user_${user.id.slice(0, 6)}`;
      let attempt = 0;

      while (await prisma.profile.findUnique({ where: { username } })) {
        attempt += 1;
        username = `${base.slice(0, 20)}_${attempt}`;
      }

      await prisma.profile.create({
        data: {
          userId: user.id,
          username,
          displayName: user.name ?? username,
          avatarUrl: user.image,
        },
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
      }

      if ((!token.role || !token.id) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
