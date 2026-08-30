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
  className = "flex size-10 shrink-0 items-center justify-center rounded-lg bg-dark text-white transition-colors hover:bg-brand-dark",
}: {
  product: Product;
  isWishlisted: boolean;
  isLoggedIn: boolean;
  className?: string;
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
        className={className}
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
