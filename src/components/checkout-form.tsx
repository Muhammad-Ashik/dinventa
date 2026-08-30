"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useCart } from "@/lib/cart-context";
import { formatBDT } from "@/lib/money";
import { createOrder } from "@/lib/actions/orders";
import { TrustBadges } from "@/components/trust-badges";

const inputClass =
  "rounded-lg border border-neutral-300 px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900";

export function CheckoutForm({
  defaultShippingAddress,
  defaultPhone,
}: {
  defaultShippingAddress: string;
  defaultPhone: string;
}) {
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (items.length === 0) {
    return (
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <form action={handleSubmit} className="flex flex-col gap-5 rounded-2xl bg-white p-5 sm:p-6 dark:bg-surface">
        <h2 className="font-semibold">Shipping Details</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="shippingAddress" className="text-sm font-medium">
            Shipping address
          </label>
          <textarea
            id="shippingAddress"
            name="shippingAddress"
            required
            rows={3}
            defaultValue={defaultShippingAddress}
            className={`resize-none ${inputClass}`}
          />
          {fieldErrors.shippingAddress && (
            <p className="text-sm text-red-600">{fieldErrors.shippingAddress[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            required
            defaultValue={defaultPhone}
            className={inputClass}
          />
          {fieldErrors.phone && <p className="text-sm text-red-600">{fieldErrors.phone[0]}</p>}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            We&apos;ll call this number to confirm your order before it ships.
          </p>
        </div>

        <TrustBadges />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50"
        >
          <LockClosedIcon className="size-4" />
          {isPending ? "Placing order..." : "Place Order (Cash on Delivery)"}
        </button>
      </form>

      <div className="h-fit rounded-2xl bg-white p-5 sm:p-6 dark:bg-surface">
        <h2 className="font-semibold">Order Summary</h2>

        <div className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 text-sm">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-band">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <span className="line-clamp-1 flex-1 text-neutral-700 dark:text-neutral-300">
                {item.name} <span className="text-neutral-400">× {item.quantity}</span>
              </span>
              <span className="shrink-0 font-medium">{formatBDT(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-brand">{formatBDT(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
