"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon, CheckIcon, ShoppingCartIcon } from "@heroicons/react/20/solid";
import { useCart } from "@/lib/cart-context";
import { WishlistButton } from "@/components/wishlist-button";

const wishlistIconClass =
  "flex size-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-300";

// Product-detail-page variant of AddToCartButton with a quantity stepper —
// kept separate from the plain AddToCartButton (used in compact grid cards,
// where a stepper would be too heavy) rather than adding a mode flag to it.
// Also carries "Purchase Now" (add the item then go straight to checkout,
// skipping a trip through the cart) and the wishlist toggle, all sharing
// this one quantity value, matching the reference's single action row.
export function AddToCartWithQuantity({
  productId,
  name,
  price,
  imageUrl,
  maxQuantity,
  isWishlisted,
  isLoggedIn,
}: {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  maxQuantity: number;
  isWishlisted: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded border border-neutral-300 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="p-2.5 transition-colors hover:bg-neutral-100 active:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:disabled:text-neutral-600"
        >
          <MinusIcon className="size-4" />
        </button>
        <span className="w-10 text-center font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={quantity >= maxQuantity}
          aria-label="Increase quantity"
          className="p-2.5 transition-colors hover:bg-neutral-100 active:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:disabled:text-neutral-600"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          addItem({ productId, name, price, imageUrl }, quantity);
          router.push("/checkout");
        }}
        className="flex-1 rounded bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
      >
        Purchase Now
      </button>

      <button
        type="button"
        onClick={() => {
          addItem({ productId, name, price, imageUrl }, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="flex flex-1 items-center justify-center gap-1.5 rounded bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
      >
        {added ? (
          <>
            <CheckIcon className="size-4" /> Added
          </>
        ) : (
          <>
            <ShoppingCartIcon className="size-4" /> Add to Cart
          </>
        )}
      </button>

      <WishlistButton
        productId={productId}
        initialWishlisted={isWishlisted}
        isLoggedIn={isLoggedIn}
        className={wishlistIconClass}
      />
    </div>
  );
}
