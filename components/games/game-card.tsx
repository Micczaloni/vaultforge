import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
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
    <Link
      href={`/games/${slug}`}
      className={cn(
        "group focus-visible:ring-ring/50 relative block overflow-hidden rounded-lg transition-transform duration-300 outline-none hover:-translate-y-1 focus-visible:ring-2",
        className,
      )}
    >
      <div className="bg-surface-elevated relative aspect-[3/4] overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.25),transparent_55%)]" />
        </div>

        {status ? (
          <div className="absolute top-2 left-2 z-10">
            <StatusBadge status={status} />
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-10 space-y-1 p-3">
          <h3 className="text-foreground line-clamp-2 text-sm leading-snug font-semibold drop-shadow-md">
            {title}
          </h3>
          {meta ? (
            <p className="text-accent/90 font-mono text-[11px] tracking-wide">
              {meta}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
