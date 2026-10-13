import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library",
};

export default function LibraryPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
      <p className="text-muted-foreground">
        Playing, completed, backlog, wishlist, and played statuses — Phase 8.
      </p>
    </div>
  );
}
