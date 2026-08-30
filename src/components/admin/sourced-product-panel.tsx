"use client";

import { useActionState } from "react";
import { formatBDT } from "@/lib/money";
import { relativeTime } from "@/lib/relative-time";
import { reVerifySourcedProduct, markProductOutOfStock, type ReVerifyState } from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";

export function SourcedProductPanel({
  product,
}: {
  product: {
    id: string;
    sourceUrl: string;
    sourceDomain: string | null;
    realPrice: number | null;
    price: number;
    lastVerifiedAt: Date | null;
    sourceCheckStatus: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState<ReVerifyState, FormData>(
    reVerifySourcedProduct.bind(null, product.id),
    undefined
  );

  const margin =
    product.realPrice !== null && product.price > 0
      ? Math.round(((product.price - product.realPrice) / product.price) * 100)
      : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
      <h2 className="font-semibold">Sourced product</h2>
      <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="w-fit text-brand hover:underline">
        View source{product.sourceDomain ? ` (${product.sourceDomain})` : ""} ↗
      </a>
      {product.realPrice !== null && (
        <p className="text-neutral-600 dark:text-neutral-400">
          Real cost: {formatBDT(product.realPrice)} · Live price: {formatBDT(product.price)}
          {margin !== null && ` · ${margin}% margin`}
        </p>
      )}
      <p className="text-neutral-500 dark:text-neutral-400">
        {product.lastVerifiedAt
          ? `Last verified ${relativeTime(product.lastVerifiedAt)} — ${product.sourceCheckStatus ?? "ok"}`
          : "Not verified since it was added."}
      </p>

      <div className="flex flex-wrap gap-2 pt-2">
        <form action={formAction}>
          <button
            type="submit"
            disabled={pending}
            className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {pending ? "Verifying..." : "Re-verify"}
          </button>
        </form>
        <form action={markProductOutOfStock.bind(null, product.id)}>
          <ActionButton variant="danger" successLabel="Marked">
            Mark out of stock
          </ActionButton>
        </form>
      </div>

      {state?.message && <p className="text-neutral-600 dark:text-neutral-400">{state.message}</p>}
    </div>
  );
}
