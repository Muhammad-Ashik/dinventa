"use client";

import { useState } from "react";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { QuickViewModal } from "@/components/quick-view-modal";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  stock: number;
};

export function QuickViewTrigger({
  product,
  isWishlisted,
  isLoggedIn,
}: {
  product: Product;
  isWishlisted: boolean;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Quick view"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:text-brand dark:border-neutral-700 dark:bg-surface dark:text-neutral-300"
      >
        <ArrowsPointingOutIcon className="size-4" />
      </button>

      {open && (
        <QuickViewModal
          product={product}
          isWishlisted={isWishlisted}
          isLoggedIn={isLoggedIn}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
