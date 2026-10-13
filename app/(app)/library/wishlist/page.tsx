import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default function WishlistPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>
      <p className="text-muted-foreground">
        Filtered library view (`status = WISHLIST`).
      </p>
    </div>
  );
}
