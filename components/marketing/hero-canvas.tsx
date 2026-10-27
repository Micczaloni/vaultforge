"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const ForgeHeroScene = dynamic(
  () =>
    import("@/components/marketing/forge-hero-scene").then(
      (mod) => mod.ForgeHeroScene,
    ),
  { ssr: false },
);

export function HeroCanvas() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(59,130,246,0.28),transparent_55%),radial-gradient(circle_at_30%_70%,rgba(34,211,238,0.12),transparent_45%)]"
      />
    );
  }

  return <ForgeHeroScene />;
}
