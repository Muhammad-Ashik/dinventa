"use client";

import { useActionState, useEffect, useState } from "react";
import { PencilSquareIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { saveAddress } from "@/lib/actions/address";

type Address = { name: string; email: string; phone: string; address: string } | null;

const inputClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900";

export function AddressCard({
  type,
  title,
  initial,
}: {
  type: "SHIPPING" | "BILLING";
  title: string;
  initial: Address;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(saveAddress.bind(null, type), undefined);

  useEffect(() => {
    if (state?.message && !state.errors) setEditing(false);
  }, [state]);

  if (editing || !initial) {
    return (
      <div className="rounded-2xl bg-white p-5 dark:bg-surface">
        <h2 className="font-semibold">{title}</h2>
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name</label>
            <input name="name" required defaultValue={initial?.name} className={inputClass} />
            {state?.errors?.name && <p className="text-sm text-red-600">{state.errors.name[0]}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" required defaultValue={initial?.email} className={inputClass} />
            {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email[0]}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Phone</label>
            <input name="phone" required defaultValue={initial?.phone} className={inputClass} />
            {state?.errors?.phone && <p className="text-sm text-red-600">{state.errors.phone[0]}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Address</label>
            <textarea name="address" required rows={2} defaultValue={initial?.address} className={`resize-none ${inputClass}`} />
            {state?.errors?.address && <p className="text-sm text-red-600">{state.errors.address[0]}</p>}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save"}
            </button>
            {initial && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium transition-colors hover:border-neutral-400 dark:border-neutral-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 dark:bg-surface">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${title}`}
          className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400"
        >
          <PencilSquareIcon className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm">
        <p className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <UserIcon className="size-4 shrink-0 text-neutral-400" /> Name: {initial.name}
        </p>
        <p className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <EnvelopeIcon className="size-4 shrink-0 text-neutral-400" /> Email: {initial.email}
        </p>
        <p className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <PhoneIcon className="size-4 shrink-0 text-neutral-400" /> Phone: {initial.phone}
        </p>
        <p className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <MapPinIcon className="size-4 shrink-0 text-neutral-400" /> Address: {initial.address}
        </p>
      </div>
    </div>
  );
}
