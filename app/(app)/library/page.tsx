import type { Metadata } from "next";
import Link from "next/link";

import { LibraryList } from "@/components/library/library-list";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getUserLibrary } from "@/lib/library/queries";
import { requirePageSession } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Library",
};

export const instant = false;

export default async function LibraryPage() {
  const session = await requirePageSession("/library");
  const items = await getUserLibrary(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        description="Track what you are playing, clearing, and stocking for later."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/library/wishlist">Wishlist</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/library/backlog">Backlog</Link>
            </Button>
          </div>
        }
      />
      <LibraryList
        items={items}
        emptyTitle="Your library is empty"
        emptyDescription="Discover a game and add it with a status to start your vault."
      />
    </div>
  );
}
