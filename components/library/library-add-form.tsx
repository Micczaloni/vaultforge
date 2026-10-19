"use client";

import { useActionState } from "react";
import type { LibraryStatus } from "@prisma/client";

import {
  addToLibraryAction,
  removeFromLibraryAction,
  updateLibraryAction,
  type LibraryActionState,
} from "@/lib/library/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const STATUSES: LibraryStatus[] = [
  "PLAYING",
  "COMPLETED",
  "BACKLOG",
  "WISHLIST",
  "PLAYED",
];

const initialState: LibraryActionState = {};

type LibraryAddFormProps = {
  gameId: string;
  existing: {
    id: string;
    status: LibraryStatus;
    favorited: boolean;
    rating: number | null;
  } | null;
};

export function LibraryAddForm({ gameId, existing }: LibraryAddFormProps) {
  const [addState, addAction, addPending] = useActionState(
    addToLibraryAction,
    initialState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateLibraryAction,
    initialState,
  );

  if (existing) {
    return (
      <div className="border-border bg-surface space-y-3 rounded-[10px] border p-4">
        <p className="text-sm font-medium">In your library</p>
        <form action={updateAction} className="space-y-3">
          <input type="hidden" name="id" value={existing.id} />
          <div className="space-y-1">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={existing.status}
              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="rating">Rating (1–10)</Label>
            <input
              id="rating"
              name="rating"
              type="number"
              min={1}
              max={10}
              defaultValue={existing.rating ?? ""}
              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="favorited"
              defaultChecked={existing.favorited}
            />
            Favorite
          </label>
          {updateState.error ? (
            <p className="text-destructive text-sm" role="alert">
              {updateState.error}
            </p>
          ) : null}
          {updateState.success ? (
            <p className="text-success text-sm" role="status">
              {updateState.success}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={updatePending}>
              {updatePending ? "Saving…" : "Update"}
            </Button>
          </div>
        </form>
        <form action={removeFromLibraryAction}>
          <input type="hidden" name="id" value={existing.id} />
          <Button type="submit" variant="outline" size="sm">
            Remove from library
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={addAction}
      className="border-border bg-surface space-y-3 rounded-[10px] border p-4"
    >
      <input type="hidden" name="gameId" value={gameId} />
      <p className="text-sm font-medium">Add to library</p>
      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue="BACKLOG"
          className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="favorited" />
        Favorite
      </label>
      {addState.error ? (
        <p className="text-destructive text-sm" role="alert">
          {addState.error}
        </p>
      ) : null}
      {addState.success ? (
        <p className="text-success text-sm" role="status">
          {addState.success}
        </p>
      ) : null}
      <Button type="submit" disabled={addPending}>
        {addPending ? "Adding…" : "Add game"}
      </Button>
    </form>
  );
}
