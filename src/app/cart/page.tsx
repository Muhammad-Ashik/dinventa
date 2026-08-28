"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatBDT } from "@/lib/money";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Your cart is empty.{" "}
          <Link href="/products" className="font-medium text-brand hover:underline">
            Browse products
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Your cart</h1>

      <div className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
            </div>

            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-brand">{formatBDT(item.price)}</p>
            </div>

            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
              className="w-16 rounded border border-neutral-300 px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
            />

            <p className="w-24 text-right font-semibold">
              {formatBDT(item.price * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-neutral-500 hover:text-brand dark:text-neutral-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="text-lg font-bold">
          Total: <span className="text-brand">{formatBDT(totalPrice)}</span>
        </p>
        <Link
          href="/checkout"
          className="rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
