import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-border mt-auto border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="text-foreground font-medium">Vaultforge</span>
          {" — Your games. Your record. Your forge."}
        </p>
        <nav aria-label="Legal" className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
