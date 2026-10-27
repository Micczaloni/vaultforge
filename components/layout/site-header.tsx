import Link from "next/link";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/games", label: "Discover" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-border/70 bg-background/70 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-foreground hover:text-accent font-semibold tracking-tight transition-colors"
          >
            Vaultforge
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 md:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
