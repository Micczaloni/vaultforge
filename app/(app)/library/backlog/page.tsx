import type { Metadata } from "next";
import Link from "next/link";

import { LibraryList } from "@/components/library/library-list";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getUserLibrary } from "@/lib/library/queries";
import { requirePageSession } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Backlog",
};

export const instant = false;

export default async function BacklogPage() {
  const session = await requirePageSession("/library/backlog");
  const items = await getUserLibrary(session.user.id, "BACKLOG");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backlog"
        description="Owned or planned titles waiting for a session."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/library">All library</Link>
          </Button>
        }
      />
      <LibraryList
        items={items}
        emptyTitle="Backlog is clear"
        emptyDescription="Add games with BACKLOG status to fill this list."
      />
    </div>
  );
}
