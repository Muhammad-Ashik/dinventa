"use client";

import { useState } from "react";
import { CheckIcon, ShoppingCartIcon } from "@heroicons/react/20/solid";
import { useCart } from "@/lib/cart-context";

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
}: {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({ productId, name, price, imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-lg bg-brand px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-dark"
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
  );
}
