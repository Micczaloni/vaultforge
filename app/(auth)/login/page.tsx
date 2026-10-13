import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          Authentication wires up in Phase 6 (Auth.js + credentials + GitHub).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" disabled>
          Continue (coming soon)
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          No account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
