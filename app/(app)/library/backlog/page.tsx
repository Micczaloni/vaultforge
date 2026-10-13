import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backlog",
};

export default function BacklogPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Backlog</h1>
      <p className="text-muted-foreground">
        Filtered library view (`status = BACKLOG`).
      </p>
    </div>
  );
}
