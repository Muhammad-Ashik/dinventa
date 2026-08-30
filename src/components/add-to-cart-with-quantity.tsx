"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon, CheckIcon, ShoppingCartIcon } from "@heroicons/react/20/solid";
import { useCart } from "@/lib/cart-context";
import { WishlistButton } from "@/components/wishlist-button";
import { QuantityInput } from "@/components/quantity-input";

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
    // Each action gets its own full-width row on mobile (cramming quantity +
    // Purchase Now + Add to Cart + wishlist into one row wrapped their labels
    // onto two lines) and returns to a single row from `sm` up. The stepper
    // and wishlist button share a row on mobile via a wrapper that becomes
    // `contents` at `sm` — its children rejoin the outer flex row directly,
    // repositioned via `sm:order-*` to match the original desktop order.
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex items-center justify-between gap-3 sm:contents">
        <div className="flex items-center rounded border border-neutral-300 sm:order-1 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="p-2.5 transition-colors hover:bg-neutral-100 active:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:disabled:text-neutral-600"
          >
            <MinusIcon className="size-4" />
          </button>
          <QuantityInput value={quantity} min={1} max={maxQuantity} onChange={setQuantity} className="w-10" />
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

        <WishlistButton
          productId={productId}
          initialWishlisted={isWishlisted}
          isLoggedIn={isLoggedIn}
          className={`${wishlistIconClass} sm:order-4`}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          addItem({ productId, name, price, imageUrl }, quantity);
          router.push("/checkout");
        }}
        className="w-full rounded bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark sm:order-2 sm:w-auto sm:flex-1"
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
        className="flex w-full items-center justify-center gap-1.5 rounded bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark sm:order-3 sm:w-auto sm:flex-1"
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
    </div>
  );
}
