"use client";

import { useActionState } from "react";
import { createProductManually } from "@/lib/actions/admin";
import type { ManualProductFormState } from "@/lib/definitions";

export function AddProductForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<ManualProductFormState, FormData>(
    createProductManually,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {state?.errors?.name && <p className="text-red-600">{state.errors.name[0]}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {state?.errors?.description && (
          <p className="text-red-600">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="price" className="font-medium">
            Price (BDT)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            required
            className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {state?.errors?.price && <p className="text-red-600">{state.errors.price[0]}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stock" className="font-medium">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={0}
            required
            className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {state?.errors?.stock && <p className="text-red-600">{state.errors.stock[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="brand" className="font-medium">
            Brand
          </label>
          <input
            id="brand"
            name="brand"
            defaultValue="Generic"
            required
            className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {state?.errors?.brand && <p className="text-red-600">{state.errors.brand[0]}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className="font-medium">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue=""
            className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="" disabled>
              Choose one
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {state?.errors?.categoryId && (
            <p className="text-red-600">{state.errors.categoryId[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="imageUrl" className="font-medium">
          Image URL <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          placeholder="https://..."
          className="rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <p className="text-xs text-neutral-500">
          Leave blank to auto-find a matching photo.
        </p>
        {state?.errors?.imageUrl && <p className="text-red-600">{state.errors.imageUrl[0]}</p>}
      </div>

      {state?.message && (
        <p className={state.errors ? "text-red-600" : "text-green-700"}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-brand px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add product"}
      </button>
    </form>
  );
}
