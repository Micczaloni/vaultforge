import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_55%)]"
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-col justify-center gap-8 px-4 py-16 sm:px-6">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
          Gaming vault platform
        </p>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Vaultforge
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg sm:text-xl">
            Your games. Your record. Your forge. Track play status, discover
            titles, unlock achievements, and climb the leaderboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/register">Start your vault</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/games">Browse games</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
