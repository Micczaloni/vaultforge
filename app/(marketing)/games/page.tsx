import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover games",
};

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Discover</h1>
      <p className="text-muted-foreground">
        Game discovery arrives in Phase 7 — search, filters, and catalog sync
        via the abstracted RAWG service.
      </p>
    </div>
  );
}
