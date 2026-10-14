import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LibraryStatus } from "@/types";

type GameCardProps = {
  slug: string;
  title: string;
  coverUrl?: string | null;
  meta?: string;
  status?: LibraryStatus;
  className?: string;
};

export function GameCard({
  slug,
  title,
  coverUrl,
  meta,
  status,
  className,
}: GameCardProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card hover:border-primary/40 overflow-hidden rounded-[10px] py-0 shadow-none transition-colors",
        className,
      )}
    >
      <Link
        href={`/games/${slug}`}
        className="block focus-visible:outline-none"
      >
        <div className="bg-surface-elevated relative aspect-[3/4]">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center px-4 text-center font-mono text-xs">
              No cover
            </div>
          )}
        </div>
        <CardContent className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-foreground line-clamp-2 text-sm leading-snug font-medium">
              {title}
            </h3>
            {status ? <StatusBadge status={status} /> : null}
          </div>
          {meta ? (
            <p className="text-muted-foreground font-mono text-xs">{meta}</p>
          ) : null}
        </CardContent>
      </Link>
    </Card>
  );
}
