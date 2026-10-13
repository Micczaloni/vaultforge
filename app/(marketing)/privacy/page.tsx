import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="text-muted-foreground">
        Placeholder privacy policy. Will document data collected for accounts,
        sessions, and library activity before production launch.
      </p>
    </div>
  );
}
