import type { Metadata } from "next";
import Link from "next/link";

import { LibraryList } from "@/components/library/library-list";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getUserLibrary } from "@/lib/library/queries";
import { requirePageSession } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Wishlist",
};

export const instant = false;

export default async function WishlistPage() {
  const session = await requirePageSession("/library/wishlist");
  const items = await getUserLibrary(session.user.id, "WISHLIST");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wishlist"
        description="Games you want to play or pick up later."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/library">All library</Link>
          </Button>
        }
      />
      <LibraryList
        items={items}
        emptyTitle="Wishlist is empty"
        emptyDescription="Mark games as wishlist from Discover or a game page."
      />
    </div>
  );
}
