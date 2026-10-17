import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { requirePageAdmin } from "@/lib/rbac";

export const instant = false;

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/achievements", label: "Achievements" },
  { href: "/admin/stats", label: "Stats" },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePageAdmin();

  return (
    <div className="flex min-h-full flex-1">
      <aside className="border-border bg-surface w-56 shrink-0 border-r">
        <div className="border-border flex h-14 items-center border-b px-4">
          <Link href="/admin" className="font-semibold tracking-tight">
            Admin
          </Link>
        </div>
        <nav aria-label="Admin" className="flex flex-col gap-1 p-3">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-border border-t p-3">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
