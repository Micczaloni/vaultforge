import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  hrefForPage: (page: number) => string;
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  hrefForPage,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) {
    return null;
  }

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <p className="text-muted-foreground font-mono text-xs">
        Page {page} of {totalPages} · {total} results
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild={Boolean(prev)}
          disabled={!prev}
        >
          {prev ? <Link href={hrefForPage(prev)}>Previous</Link> : "Previous"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild={Boolean(next)}
          disabled={!next}
        >
          {next ? <Link href={hrefForPage(next)}>Next</Link> : "Next"}
        </Button>
      </div>
    </nav>
  );
}
