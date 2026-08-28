"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon, CheckIcon, ShoppingCartIcon } from "@heroicons/react/20/solid";
import { useCart } from "@/lib/cart-context";

// Product-detail-page variant of AddToCartButton with a quantity stepper —
// kept separate from the plain AddToCartButton (used in compact grid cards,
// where a stepper would be too heavy) rather than adding a mode flag to it.
export function AddToCartWithQuantity({
  productId,
  name,
  price,
  imageUrl,
  maxQuantity,
}: {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  maxQuantity: number;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded border border-neutral-300">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="p-2.5 transition-colors hover:bg-neutral-100 active:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
        >
          <MinusIcon className="size-4" />
        </button>
        <span className="w-10 text-center font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={quantity >= maxQuantity}
          aria-label="Increase quantity"
          className="p-2.5 transition-colors hover:bg-neutral-100 active:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          addItem({ productId, name, price, imageUrl }, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="flex flex-1 items-center justify-center gap-1.5 rounded bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
      >
        {added ? (
          <>
            <CheckIcon className="size-4" /> Added
          </>
        ) : (
          <>
            <ShoppingCartIcon className="size-4" /> Add to cart
          </>
        )}
      </button>
    </div>
  );
}
