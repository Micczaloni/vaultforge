import type { Metadata } from "next";
import Link from "next/link";

import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";
import { requirePageSession } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Profile settings",
};

export const instant = false;

export default async function ProfileSettingsPage() {
  const session = await requirePageSession("/settings/profile");
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { userId: session.user.id },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile settings"
        description="Control how your forge appears to other players."
        actions={
          <Link
            href={`/u/${profile.username}`}
            className="text-primary text-sm hover:underline"
          >
            View public profile
          </Link>
        }
      />
      <ProfileSettingsForm
        username={profile.username}
        displayName={profile.displayName}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
        isPublic={profile.isPublic}
      />
    </div>
  );
}
