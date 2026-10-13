import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity",
};

export default function ActivityPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
      <p className="text-muted-foreground">Activity feed — Phase 11.</p>
    </div>
  );
}
