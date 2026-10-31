import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageBackdrop } from "@/components/shared/page-backdrop";
import { requirePageSession } from "@/lib/rbac";

export const instant = false;

const appNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/library", label: "Library" },
  { href: "/achievements", label: "Achievements" },
  { href: "/activity", label: "Activity" },
  { href: "/settings/profile", label: "Settings" },
] as const;

export default async function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requirePageSession("/dashboard");

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-gradient-to-b from-[#142044] via-[#10193a] to-[#0b1430] md:block">
        <div className="flex h-14 items-center border-b border-white/10 px-4">
          <Link
            href="/"
            className="font-semibold tracking-tight text-white hover:text-cyan-300"
          >
            Vaultforge
          </Link>
        </div>
        <nav aria-label="App" className="flex flex-col gap-1 p-3">
          {appNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <p className="text-muted-foreground mb-2 truncate px-2 text-xs">
            {session.user.email}
          </p>
          <SignOutButton />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border flex h-14 items-center justify-between border-b px-4 md:hidden">
          <Link href="/" className="font-semibold tracking-tight">
            Vaultforge
          </Link>
          <SignOutButton />
        </header>
        <main className="relative flex-1 p-4 sm:p-6">
          <PageBackdrop height="h-[260px]" />
          {children}
        </main>
      </div>
    </div>
  );
}
