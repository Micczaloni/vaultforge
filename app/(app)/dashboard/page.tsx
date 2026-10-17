import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { requirePageSession } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requirePageSession("/dashboard");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description={`Signed in as ${session.user.email}. Library stats and recommendations expand in later phases.`}
      />
      <p className="text-muted-foreground font-mono text-sm">
        role: {session.user.role}
      </p>
    </div>
  );
}
