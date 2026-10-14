import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { GameCard } from "@/components/games/game-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { LibraryStatus } from "@/types";

export const metadata: Metadata = {
  title: "UI playground",
  robots: { index: false, follow: false },
};

const STATUSES: LibraryStatus[] = [
  "PLAYING",
  "COMPLETED",
  "BACKLOG",
  "WISHLIST",
  "PLAYED",
];

export default function UiPlaygroundPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
      <PageHeader
        title="Design system"
        description="Obsidian Terminal primitives used across Vaultforge. Internal playground — not linked in primary nav."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Back home</Link>
          </Button>
        }
      />

      <section className="space-y-4" aria-labelledby="buttons-heading">
        <h2 id="buttons-heading" className="text-lg font-semibold">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="text-lg font-semibold">
          Status badges
        </h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          <Badge>Default</Badge>
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="forms-heading">
        <h2 id="forms-heading" className="text-lg font-semibold">
          Forms
        </h2>
        <Card className="max-w-md rounded-[10px]">
          <CardHeader>
            <CardTitle>Profile snippet</CardTitle>
            <CardDescription>
              Label + input patterns for settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" placeholder="Forge Master" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="What are you playing?" rows={3} />
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="cards-heading">
        <h2 id="cards-heading" className="text-lg font-semibold">
          Game cards
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <GameCard
            slug="hollow-knight"
            title="Hollow Knight"
            meta="2017 · Metroidvania"
            status="COMPLETED"
          />
          <GameCard
            slug="hades"
            title="Hades"
            meta="2020 · Roguelike"
            status="PLAYING"
          />
          <GameCard slug="placeholder" title="Untitled Prototype" meta="TBA" />
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="states-heading">
        <h2 id="states-heading" className="text-lg font-semibold">
          Empty / loading / error
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <EmptyState
            title="Library is empty"
            description="Add a game from Discover to start tracking."
            icon={<Gamepad2 className="size-8" />}
            action={<Button size="sm">Browse games</Button>}
          />
          <div className="border-border bg-surface space-y-3 rounded-[10px] border p-4">
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <ErrorState />
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="alert-heading">
        <h2 id="alert-heading" className="text-lg font-semibold">
          Alert
        </h2>
        <Alert className="max-w-xl">
          <AlertTitle className="font-mono text-xs tracking-wide uppercase">
            XP tip
          </AlertTitle>
          <AlertDescription>
            Completing games and unlocking achievements increases your forge
            ranking.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
