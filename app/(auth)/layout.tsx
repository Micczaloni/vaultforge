import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-border border-b px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-foreground hover:text-primary font-semibold tracking-tight"
        >
          Vaultforge
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
