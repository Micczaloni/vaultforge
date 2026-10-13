import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile settings",
};

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Profile settings
      </h1>
      <p className="text-muted-foreground">
        Username, bio, avatar URL, public/private — Phase 9.
      </p>
    </div>
  );
}
