import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface/50 flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed px-6 py-16 text-center",
        className,
      )}
      role="status"
    >
      <div className="text-muted-foreground" aria-hidden>
        {icon ?? <Inbox className="size-8" />}
      </div>
      <div className="space-y-1">
        <p className="text-foreground font-medium">{title}</p>
        {description ? (
          <p className="text-muted-foreground max-w-sm text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
