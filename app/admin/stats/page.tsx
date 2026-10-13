import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Stats",
};

export default function AdminStatsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">System stats</h1>
      <p className="text-muted-foreground">Aggregates placeholder.</p>
    </div>
  );
}
