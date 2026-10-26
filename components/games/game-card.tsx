import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoCoverUrl } from "@/lib/games/covers";
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
  const imageSrc = coverUrl || demoCoverUrl(slug);

  return (
    <Card
      className={cn(
        "group border-border bg-card hover:border-primary/50 overflow-hidden rounded-[10px] py-0 shadow-none transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <Link
        href={`/games/${slug}`}
        className="block focus-visible:outline-none"
      >
        <div className="bg-surface-elevated relative aspect-[3/4] overflow-hidden">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="from-background/90 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="text-foreground line-clamp-2 text-sm leading-snug font-semibold drop-shadow">
              {title}
            </p>
          </div>
        </div>
        <CardContent className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="sr-only">{title}</h3>
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
