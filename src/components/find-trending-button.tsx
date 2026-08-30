"use client";

import { useActionState } from "react";
import { findTrendingProducts } from "@/lib/actions/admin";

export function FindTrendingButton({
  categories,
  defaultCategoryId,
}: {
  categories: { id: string; name: string; productCount: number }[];
  defaultCategoryId: string;
}) {
  const [state, formAction, isPending] = useActionState(findTrendingProducts, undefined);

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={formAction} className="flex items-center gap-2">
        <select
          name="categoryId"
          defaultValue={defaultCategoryId}
          className="rounded border border-neutral-300 px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.productCount})
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Searching..." : "Find real products"}
        </button>
      </form>

      {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
      {state && "warning" in state && state.warning && (
        <p className="max-w-sm text-right text-sm text-amber-600 dark:text-amber-500">{state.warning}</p>
      )}
    </div>
  );
}
