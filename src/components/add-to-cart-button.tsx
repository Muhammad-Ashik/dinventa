"use client";

import { useState } from "react";
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

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ productId, name, price, imageUrl });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="w-full rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
