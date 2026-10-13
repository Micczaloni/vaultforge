import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
      <p className="text-muted-foreground">
        RBAC-protected admin area — Phase 13. Middleware will enforce ADMIN
        role.
      </p>
    </div>
  );
}
