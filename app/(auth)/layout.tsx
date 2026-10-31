import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/hero/bg3-hero.jpg"
          alt=""
          fill
          unoptimized
          priority
          className="object-cover object-[65%_center] opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(11,20,48,0.95)_0%,rgba(11,20,48,0.85)_45%,rgba(11,20,48,0.45)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(34,211,238,0.22),transparent_45%)]" />
      </div>

      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-white hover:text-cyan-300"
        >
          Vaultforge
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="[&>*]:shadow-[0_30px_80px_rgba(0,0,0,0.55)] [&>*]:backdrop-blur-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
