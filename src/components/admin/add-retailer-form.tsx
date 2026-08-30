"use client";

import { useActionState } from "react";
import { addVettedRetailer } from "@/lib/actions/admin";
import type { VettedRetailerFormState } from "@/lib/definitions";

const INPUT_CLASS =
  "rounded border border-neutral-300 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900";

export function AddRetailerForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<VettedRetailerFormState, FormData>(
    addVettedRetailer,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 text-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="retailer-name" className="font-medium">
          Name
        </label>
        <input id="retailer-name" name="name" required className={INPUT_CLASS} />
        {state?.errors?.name && <p className="text-red-600">{state.errors.name[0]}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="retailer-domain" className="font-medium">
          Domain
        </label>
        <input id="retailer-domain" name="domain" placeholder="example.com" required className={INPUT_CLASS} />
        {state?.errors?.domain && <p className="text-red-600">{state.errors.domain[0]}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="retailer-category" className="font-medium">
          Category
        </label>
        <select id="retailer-category" name="categoryId" required defaultValue="" className={INPUT_CLASS}>
          <option value="" disabled>
            Choose one
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {state?.errors?.categoryId && <p className="text-red-600">{state.errors.categoryId[0]}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add retailer"}
      </button>
      {state?.message && (
        <p className={`w-full ${state.errors ? "text-red-600" : "text-green-700 dark:text-green-400"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
