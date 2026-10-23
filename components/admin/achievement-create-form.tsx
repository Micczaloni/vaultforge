"use client";

import { useActionState } from "react";

import {
  createAchievementAction,
  type AdminActionState,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: AdminActionState = {};

export function AchievementCreateForm() {
  const [state, formAction, pending] = useActionState(
    createAchievementAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="border-border bg-surface space-y-3 rounded-[10px] border p-4"
    >
      <h2 className="font-medium">Create achievement</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" placeholder="FIRST_GAME" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="xpReward">XP reward</Label>
          <Input
            id="xpReward"
            name="xpReward"
            type="number"
            min={0}
            defaultValue={50}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="criteriaType">Criteria type</Label>
          <select
            id="criteriaType"
            name="criteriaType"
            className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
            defaultValue="library_count"
          >
            <option value="library_count">library_count</option>
            <option value="status_count">status_count</option>
            <option value="favorite_count">favorite_count</option>
            <option value="xp">xp</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="criteriaStatus">Status (if needed)</Label>
          <select
            id="criteriaStatus"
            name="criteriaStatus"
            className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
            defaultValue="COMPLETED"
          >
            <option value="PLAYING">PLAYING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="BACKLOG">BACKLOG</option>
            <option value="WISHLIST">WISHLIST</option>
            <option value="PLAYED">PLAYED</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="criteriaMin">Min</Label>
          <Input
            id="criteriaMin"
            name="criteriaMin"
            type="number"
            min={1}
            defaultValue={1}
            required
          />
        </div>
      </div>
      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-success text-sm" role="status">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create"}
      </Button>
    </form>
  );
}
