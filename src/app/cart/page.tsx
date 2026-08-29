"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart-context";
import { formatBDT } from "@/lib/money";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function CartPage() {
  const { items, setQuantity, removeItem, clear, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      // Full-bleed grey page canvas, matching /login and /register — the
      // "cart div" (this empty-state card) is the only thing that stays
      // white here. Breadcrumbs live inside the band so the -mt-8 cancels
      // the layout's top padding right up to the header.
      <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Cart" }]} />
          <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center dark:bg-surface">
            <span className="flex size-20 items-center justify-center rounded-full bg-dark text-white">
              <ShoppingCartIcon className="size-9" />
            </span>
            <p className="mt-4 text-lg font-medium">Your cart is empty!</p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Cart" }]} />

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold sm:text-2xl">Your Cart</h1>
          <button
            type="button"
            onClick={clear}
            className="text-sm font-medium text-brand transition-colors hover:underline"
          >
            Clear Shopping Cart
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white dark:bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Quantity</th>
                <th className="px-5 py-4 font-medium">Subtotal</th>
                <th className="px-5 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {items.map((item) => (
                <tr key={item.productId}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-band">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-brand">{formatBDT(item.price)}</td>
                  <td className="px-5 py-4">
                    <div className="flex w-fit items-center rounded-lg border border-neutral-200 dark:border-neutral-700">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="flex size-8 items-center justify-center text-neutral-600 hover:text-brand dark:text-neutral-300"
                      >
                        –
                      </button>
                      <span className="flex w-8 items-center justify-center border-x border-neutral-200 py-1 dark:border-neutral-700">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="flex size-8 items-center justify-center text-neutral-600 hover:text-brand dark:text-neutral-300"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold">{formatBDT(item.price * item.quantity)}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.productId)}
                      className="flex size-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full rounded-xl bg-white p-5 lg:max-w-sm dark:bg-surface">
            <h2 className="font-semibold">Order Summary</h2>

            <div className="mt-4 flex items-center justify-between border-b border-neutral-200 pb-3 text-sm font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <span>Product</span>
              <span>Subtotal</span>
            </div>

            <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-3 text-sm">
                  <span className="line-clamp-1 pr-4 text-neutral-700 dark:text-neutral-300">
                    {item.name}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatBDT(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-brand">{formatBDT(totalPrice)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-5 flex w-full items-center justify-center rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
            >
              Process to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
