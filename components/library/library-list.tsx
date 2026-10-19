import Link from "next/link";
import type { LibraryStatus } from "@prisma/client";

import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  removeFromLibraryAction,
  updateLibraryFormAction,
} from "@/lib/library/actions";

type LibraryItem = {
  id: string;
  status: LibraryStatus;
  favorited: boolean;
  rating: number | null;
  game: {
    slug: string;
    title: string;
    coverUrl: string | null;
  };
};

const STATUSES: LibraryStatus[] = [
  "PLAYING",
  "COMPLETED",
  "BACKLOG",
  "WISHLIST",
  "PLAYED",
];

export function LibraryList({
  items,
  emptyTitle,
  emptyDescription,
}: {
  items: LibraryItem[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Button asChild>
            <Link href="/games">Discover games</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="border-border bg-card flex flex-col gap-3 rounded-[10px] border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <Link
              href={`/games/${item.game.slug}`}
              className="hover:text-primary font-medium"
            >
              {item.game.title}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />
              {item.favorited ? (
                <span className="text-accent font-mono text-xs">favorite</span>
              ) : null}
              {item.rating != null ? (
                <span className="text-muted-foreground font-mono text-xs">
                  rated {item.rating}/10
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form
              action={updateLibraryFormAction}
              className="flex items-center gap-2"
            >
              <input type="hidden" name="id" value={item.id} />
              <label className="sr-only" htmlFor={`status-${item.id}`}>
                Change status for {item.game.title}
              </label>
              <select
                id={`status-${item.id}`}
                name="status"
                defaultValue={item.status}
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="outline">
                Save
              </Button>
            </form>
            <form action={removeFromLibraryAction}>
              <input type="hidden" name="id" value={item.id} />
              <Button type="submit" size="sm" variant="ghost">
                Remove
              </Button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
