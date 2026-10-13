import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        About Vaultforge
      </h1>
      <p className="text-muted-foreground">
        Vaultforge is a personal gaming vault with a light social layer: track
        your library, discover games, earn platform achievements, and compare
        progress on the leaderboard.
      </p>
    </div>
  );
}
