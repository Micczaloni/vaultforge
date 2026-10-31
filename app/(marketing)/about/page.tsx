import type { Metadata } from "next";

import { PageBackdrop } from "@/components/shared/page-backdrop";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "About",
};

const pillars = [
  {
    title: "Real game art",
    body: "Covers and cinematic backdrops come straight from the Steam CDN — no API key, no placeholders.",
  },
  {
    title: "Your record",
    body: "Wishlist, backlog, playing, completed. Favorite and rate titles; everything feeds your activity feed.",
  },
  {
    title: "Forge progression",
    body: "Platform achievements award XP. Public profiles compete on a leaderboard.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6">
      <PageBackdrop />
      <PageHeader
        eyebrow="About"
        title="About Vaultforge"
        description="A personal gaming vault with a light social layer: track your library, discover games, earn achievements, and compare progress."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-white">{p.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
