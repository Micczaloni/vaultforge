import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="text-muted-foreground">
        XP rankings land in Phase 12 once profiles and achievements are live.
      </p>
    </div>
  );
}
