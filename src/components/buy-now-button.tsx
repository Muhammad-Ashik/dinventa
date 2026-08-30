"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

// Grid-card counterpart to AddToCartWithQuantity's "Purchase Now" — adds a
// single unit then jumps straight to checkout, skipping a trip through the
// cart, without needing the quantity stepper the detail page has room for.
export function BuyNowButton({
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
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ productId, name, price, imageUrl });
        router.push("/checkout");
      }}
      className="flex h-10 flex-1 items-center justify-center rounded-lg bg-brand px-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
    >
      Buy Now
    </button>
  );
}
