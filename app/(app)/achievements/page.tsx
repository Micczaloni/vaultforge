import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
};

export default function AchievementsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
      <p className="text-muted-foreground">Platform achievements — Phase 10.</p>
    </div>
  );
}
