import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account settings",
};

export default function AccountSettingsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Account settings
      </h1>
      <p className="text-muted-foreground">
        Email, password, connected OAuth accounts — after Phase 6.
      </p>
    </div>
  );
}
