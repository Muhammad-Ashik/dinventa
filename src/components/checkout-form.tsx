"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatBDT } from "@/lib/money";
import { createOrder } from "@/lib/actions/orders";

export function CheckoutForm({ defaultPhone }: { defaultPhone: string }) {
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (items.length === 0) {
    return (
      <p className="text-neutral-600 dark:text-neutral-400">
        Your cart is empty.{" "}
        <Link href="/products" className="font-medium text-brand hover:underline">
          Browse products
        </Link>
        .
      </p>
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: String(formData.get("shippingAddress") ?? ""),
        phone: String(formData.get("phone") ?? ""),
      });

      if ("error" in result) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      clear();
      router.push(`/orders/${result.orderId}`);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <form action={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="shippingAddress" className="text-sm font-medium">
            Shipping address
          </label>
          <textarea
            id="shippingAddress"
            name="shippingAddress"
            required
            rows={3}
            className="rounded border border-neutral-300 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
          />
          {fieldErrors.shippingAddress && (
            <p className="text-sm text-red-600">{fieldErrors.shippingAddress[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            required
            defaultValue={defaultPhone}
            className="rounded border border-neutral-300 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
          />
          {fieldErrors.phone && (
            <p className="text-sm text-red-600">{fieldErrors.phone[0]}</p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            We&apos;ll call this number to confirm your order before it ships.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50"
        >
          {isPending ? "Placing order..." : "Place order (Cash on Delivery)"}
        </button>
      </form>

      <div className="flex h-fit flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="font-semibold">Order summary</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatBDT(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold dark:border-neutral-700">
          <span>Total</span>
          <span className="text-brand">{formatBDT(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
