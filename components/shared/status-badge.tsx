import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LibraryStatus } from "@/types";

const STATUS_LABELS: Record<LibraryStatus, string> = {
  PLAYING: "Playing",
  COMPLETED: "Completed",
  BACKLOG: "Backlog",
  WISHLIST: "Wishlist",
  PLAYED: "Played",
};

const STATUS_STYLES: Record<LibraryStatus, string> = {
  PLAYING: "border-primary/40 bg-primary/15 text-primary",
  COMPLETED: "border-success/40 bg-success/15 text-success",
  BACKLOG: "border-warning/40 bg-warning/15 text-warning",
  WISHLIST: "border-accent/40 bg-accent/15 text-accent",
  PLAYED: "border-border bg-muted text-muted-foreground",
};

type StatusBadgeProps = {
  status: LibraryStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-medium", STATUS_STYLES[status], className)}
    >
      <span className="sr-only">Library status: </span>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
