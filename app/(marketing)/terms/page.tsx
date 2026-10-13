import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>
      <p className="text-muted-foreground">
        Placeholder terms of use for the Vaultforge portfolio application.
      </p>
    </div>
  );
}
