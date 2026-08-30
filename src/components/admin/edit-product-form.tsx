"use client";

import { useActionState } from "react";
import { updateProduct } from "@/lib/actions/admin";
import type { ManualProductFormState } from "@/lib/definitions";

const INPUT_CLASS =
  "rounded border border-neutral-300 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900";

export function EditProductForm({
  product,
  categories,
}: {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    saleEndsAt: Date | null;
    stock: number;
    brand: string;
    categoryId: string;
  };
  categories: { id: string; name: string }[];
}) {
  const action = updateProduct.bind(null, product.id);
  const [state, formAction, pending] = useActionState<ManualProductFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="font-medium">
          Name
        </label>
        <input id="name" name="name" required defaultValue={product.name} className={INPUT_CLASS} />
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
          defaultValue={product.description}
          className={INPUT_CLASS}
        />
        {state?.errors?.description && <p className="text-red-600">{state.errors.description[0]}</p>}
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
            defaultValue={product.price}
            className={INPUT_CLASS}
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
            required
            defaultValue={product.stock}
            className={INPUT_CLASS}
          />
          {state?.errors?.stock && <p className="text-red-600">{state.errors.stock[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="compareAtPrice" className="font-medium">
          Original price (BDT) <span className="font-normal text-neutral-500 dark:text-neutral-400">(optional)</span>
        </label>
        <input
          id="compareAtPrice"
          name="compareAtPrice"
          type="number"
          min={1}
          defaultValue={product.compareAtPrice ?? undefined}
          className={INPUT_CLASS}
        />
        {state?.errors?.compareAtPrice && <p className="text-red-600">{state.errors.compareAtPrice[0]}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="saleEndsAt" className="font-medium">
          Sale ends at <span className="font-normal text-neutral-500 dark:text-neutral-400">(optional)</span>
        </label>
        <input
          id="saleEndsAt"
          name="saleEndsAt"
          type="datetime-local"
          defaultValue={product.saleEndsAt ? product.saleEndsAt.toISOString().slice(0, 16) : undefined}
          className={INPUT_CLASS}
        />
        {state?.errors?.saleEndsAt && <p className="text-red-600">{state.errors.saleEndsAt[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="brand" className="font-medium">
            Brand
          </label>
          <input id="brand" name="brand" required defaultValue={product.brand} className={INPUT_CLASS} />
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
            defaultValue={product.categoryId}
            className={INPUT_CLASS}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {state?.errors?.categoryId && <p className="text-red-600">{state.errors.categoryId[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="imageUrl" className="font-medium">
          Image URL <span className="font-normal text-neutral-500 dark:text-neutral-400">(optional)</span>
        </label>
        <input id="imageUrl" name="imageUrl" placeholder="https://..." className={INPUT_CLASS} />
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Leave blank to keep the current photo.</p>
        {state?.errors?.imageUrl && <p className="text-red-600">{state.errors.imageUrl[0]}</p>}
      </div>

      {state?.message && (
        <p className={state.errors ? "text-red-600" : "text-green-700 dark:text-green-400"}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-brand px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
