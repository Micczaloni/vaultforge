import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Users",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="text-muted-foreground">User management placeholder.</p>
    </div>
  );
}
