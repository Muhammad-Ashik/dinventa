"use client";

import { useActionState } from "react";
import { findTrendingProducts } from "@/lib/actions/admin";

export function FindTrendingButton() {
  const [state, formAction, isPending] = useActionState(findTrendingProducts, undefined);

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors transition-colors hover:bg-brand-dark active:bg-brand-dark active:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Finding trending products..." : "Find trending products"}
        </button>
      </form>

      {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
