"use client";

import { useActionState, useState } from "react";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { submitReview } from "@/lib/actions/reviews";
import type { ReviewFormState } from "@/lib/definitions";

export function ReviewForm({ productSlug, productId }: { productSlug: string; productId: string }) {
  const submitReviewForProduct = submitReview.bind(null, productSlug, productId);
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    submitReviewForProduct,
    undefined
  );
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  if (state?.message === "Thanks for your review!") {
    return <p className="text-sm font-medium text-green-700">{state.message}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
      <p className="text-sm font-semibold">Rate this product</p>

      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const filled = value <= (hovered || rating);
          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              className="text-amber-400"
            >
              {filled ? <StarSolid className="size-6" /> : <StarOutline className="size-6" />}
            </button>
          );
        })}
      </div>
      <input type="hidden" name="rating" value={rating} />
      {state?.errors?.rating && <p className="text-xs text-red-600">{state.errors.rating[0]}</p>}

      <textarea
        name="comment"
        rows={3}
        placeholder="Share your experience (optional)"
        className="rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
      />
      {state?.errors?.comment && <p className="text-xs text-red-600">{state.errors.comment[0]}</p>}

      {state?.message && state.message !== "Thanks for your review!" && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="w-fit rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
