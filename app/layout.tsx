import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vaultforge",
    template: "%s · Vaultforge",
  },
  description:
    "Your games. Your record. Your forge. Track, discover, and compare your gaming journey.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} dark h-full`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
