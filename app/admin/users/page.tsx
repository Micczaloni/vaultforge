import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Admin · Users",
};

export const instant = false;

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          username: true,
          displayName: true,
          xp: true,
          isPublic: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Latest accounts and roles in the vault."
      />
      <div className="border-border overflow-x-auto rounded-[10px] border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-border bg-surface border-b">
            <tr>
              <th className="px-3 py-2 font-medium">User</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">XP</th>
              <th className="px-3 py-2 font-medium">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-border/70 border-b">
                <td className="px-3 py-2">
                  {user.profile ? (
                    <Link
                      href={`/u/${user.profile.username}`}
                      className="text-primary hover:underline"
                    >
                      @{user.profile.username}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{user.email}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline">{user.role}</Badge>
                </td>
                <td className="px-3 py-2 font-mono">{user.profile?.xp ?? 0}</td>
                <td className="text-muted-foreground px-3 py-2">
                  {user.profile?.isPublic ? "public" : "private"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
