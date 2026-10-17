import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
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

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const params = await searchParams;
  const githubEnabled = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          Access your vault, library, and forge stats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {params.registered ? (
          <p className="text-success text-sm" role="status">
            Account created. You can log in now.
          </p>
        ) : null}
        <LoginForm
          callbackUrl={params.callbackUrl ?? "/dashboard"}
          githubEnabled={githubEnabled}
        />
      </CardContent>
    </Card>
  );
}
