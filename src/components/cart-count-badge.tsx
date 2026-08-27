"use client";

import { useCart } from "@/lib/cart-context";

export function CartCountBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-medium text-white">
      {totalItems}
    </span>
  );
}
