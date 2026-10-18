import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "rating", label: "Rating" },
  { value: "title", label: "Title" },
  { value: "releaseDate", label: "Release date" },
] as const;

const ORDER_OPTIONS = [
  { value: "desc", label: "Desc" },
  { value: "asc", label: "Asc" },
] as const;

type DiscoveryFiltersProps = {
  q: string;
  genre: string;
  platform: string;
  sort: string;
  order: string;
  genres: string[];
  platforms: string[];
};

export function DiscoveryFilters({
  q,
  genre,
  platform,
  sort,
  order,
  genres,
  platforms,
}: DiscoveryFiltersProps) {
  return (
    <form
      className="border-border bg-surface grid gap-3 rounded-[10px] border p-4 sm:grid-cols-2 lg:grid-cols-6"
      action="/games"
    >
      <div className="space-y-1 lg:col-span-2">
        <label htmlFor="game-search" className="text-muted-foreground text-xs">
          Search
        </label>
        <input
          id="game-search"
          name="q"
          defaultValue={q}
          placeholder="Search titles…"
          className="border-input bg-background focus-visible:ring-ring/40 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="genre" className="text-muted-foreground text-xs">
          Genre
        </label>
        <select
          id="genre"
          name="genre"
          defaultValue={genre}
          className="border-input bg-background focus-visible:ring-ring/40 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
        >
          <option value="">All genres</option>
          {genres.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="platform" className="text-muted-foreground text-xs">
          Platform
        </label>
        <select
          id="platform"
          name="platform"
          defaultValue={platform}
          className="border-input bg-background focus-visible:ring-ring/40 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
        >
          <option value="">All platforms</option>
          {platforms.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="sort" className="text-muted-foreground text-xs">
          Sort
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort}
          className="border-input bg-background focus-visible:ring-ring/40 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="order" className="text-muted-foreground text-xs">
          Order
        </label>
        <div className="flex gap-2">
          <select
            id="order"
            name="order"
            defaultValue={order}
            className="border-input bg-background focus-visible:ring-ring/40 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
          >
            {ORDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button type="submit" className="shrink-0">
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
}
