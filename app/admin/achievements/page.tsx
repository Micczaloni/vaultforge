import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Achievements",
};

export default function AdminAchievementsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
      <p className="text-muted-foreground">Achievement CRUD placeholder.</p>
    </div>
  );
}
