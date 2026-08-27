"use client";

import { useActionState } from "react";
import { updateOrderShippingInfo } from "@/lib/actions/admin";
import type { CheckoutFormState } from "@/lib/definitions";

export function OrderShippingForm({
  orderId,
  shippingAddress,
  phone,
  locked,
}: {
  orderId: string;
  shippingAddress: string;
  phone: string;
  locked: boolean;
}) {
  const action = updateOrderShippingInfo.bind(null, orderId);
  const [state, formAction, pending] = useActionState<CheckoutFormState, FormData>(
    action,
    undefined
  );

  if (locked) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-neutral-500">This order is declined/cancelled — no longer editable.</p>
        <p>{shippingAddress}</p>
        <p>{phone}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="shippingAddress" className="font-medium">
          Shipping address
        </label>
        <textarea
          id="shippingAddress"
          name="shippingAddress"
          required
          rows={3}
          defaultValue={shippingAddress}
          className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {state?.errors?.shippingAddress && (
          <p className="text-red-600">{state.errors.shippingAddress[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="font-medium">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          required
          defaultValue={phone}
          className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {state?.errors?.phone && <p className="text-red-600">{state.errors.phone[0]}</p>}
      </div>

      {state?.message && (
        <p className={state.errors ? "text-red-600" : "text-green-700"}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-brand px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
