"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { formatBDT } from "@/lib/money";
import { relativeTime } from "@/lib/relative-time";
import { approveProduct, rejectProduct, bulkApproveProducts, bulkRejectProducts } from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";

type PendingProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  realPrice: number | null;
  sourceUrl: string | null;
  sourceDomain: string | null;
  isSubstitute: boolean;
  imageUrl: string;
  createdAt: Date;
  category: { name: string };
};

export function PendingProductsGrid({ products }: { products: PendingProduct[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))));
  }

  // No dialog/modal library exists in this project — a plain window.confirm
  // is the simplest guard against an accidental bulk action (idea 15).
  function bulkApprove() {
    if (selected.size === 0 || !window.confirm(`Approve ${selected.size} selected product(s)?`)) return;
    const ids = [...selected];
    startTransition(async () => {
      await bulkApproveProducts(ids);
      setSelected(new Set());
    });
  }

  function bulkReject() {
    if (selected.size === 0 || !window.confirm(`Reject ${selected.size} selected product(s)?`)) return;
    const ids = [...selected];
    startTransition(async () => {
      await bulkRejectProducts(ids);
      setSelected(new Set());
    });
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No pending suggestions. Click &quot;Find real products&quot; to search for some.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={selected.size === products.length} onChange={toggleAll} />
          Select all ({selected.size}/{products.length})
        </label>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={bulkApprove}
              className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              Approve selected
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={bulkReject}
              className="rounded border border-red-600 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
            >
              Reject selected
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {products.map((product) => (
          <PendingProductCard
            key={product.id}
            product={product}
            selected={selected.has(product.id)}
            onToggle={() => toggle(product.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PendingProductCard({
  product,
  selected,
  onToggle,
}: {
  product: PendingProduct;
  selected: boolean;
  onToggle: () => void;
}) {
  const margin =
    product.realPrice !== null && product.price > 0
      ? Math.round(((product.price - product.realPrice) / product.price) * 100)
      : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-start gap-2">
        <input type="checkbox" checked={selected} onChange={onToggle} className="mt-1 shrink-0" aria-label={`Select ${product.name}`} />
        <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <span>{product.category.name}</span>
        <span>· {relativeTime(product.createdAt)}</span>
        {product.isSubstitute && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
            Substitute
          </span>
        )}
        {!product.sourceUrl && (
          <span
            title="No real-search provider was available when this was found — this is a plausible guess, not a real listing, and the photo is a generic stock-photo keyword match."
            className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800 dark:bg-red-950/40 dark:text-red-400"
          >
            AI guess — not real
          </span>
        )}
      </div>

      <p className="font-medium">{product.name}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{product.description}</p>

      <div className="text-sm">
        <p className="font-semibold">{formatBDT(product.price)}</p>
        {product.realPrice !== null && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatBDT(product.realPrice)} real + {formatBDT(product.price - product.realPrice)} markup
            {margin !== null && ` · ${margin}% margin`}
          </p>
        )}
      </div>

      {/* Live link next to our card doubles as the side-by-side comparison
          (idea 17) — no embedded iframe, which would be unreliable
          cross-origin and unnecessary complexity for this. */}
      {product.sourceUrl && (
        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="w-fit rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          via {product.sourceDomain} ↗
        </a>
      )}

      <form action={approveProduct.bind(null, product.id)} className="flex flex-col gap-2 pt-1">
        <input
          name="price"
          type="number"
          min={1}
          defaultValue={product.price}
          aria-label="Price (BDT)"
          className="rounded border border-neutral-300 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
        />
        <textarea
          name="description"
          rows={2}
          defaultValue={product.description}
          aria-label="Description"
          className="rounded border border-neutral-300 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
        />
        <ActionButton variant="primary" successLabel="Approved">
          Approve
        </ActionButton>
      </form>
      <form action={rejectProduct.bind(null, product.id)}>
        <ActionButton variant="danger" successLabel="Rejected">
          Reject
        </ActionButton>
      </form>
    </div>
  );
}
