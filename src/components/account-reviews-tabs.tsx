"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";

type NeedsReviewProduct = { id: string; slug: string; name: string; imageUrl: string };
type ReviewedEntry = {
  id: string;
  rating: number;
  comment: string | null;
  product: { id: string; slug: string; name: string; imageUrl: string };
};

const TABS = ["Need to Review", "Reviewed Products"] as const;

export function AccountReviewsTabs({
  needsReview,
  reviewed,
}: {
  needsReview: NeedsReviewProduct[];
  reviewed: ReviewedEntry[];
}) {
  const [active, setActive] = useState<(typeof TABS)[number]>("Need to Review");

  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6 dark:bg-surface">
      <div className="flex gap-6 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`pb-3 text-sm font-medium transition-colors ${
              active === tab
                ? "border-b-2 border-brand text-brand"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {tab} {tab === "Need to Review" ? `(${needsReview.length})` : `(${reviewed.length})`}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {active === "Need to Review" &&
          (needsReview.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Nothing to review right now — products you&apos;ve received will show up here.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {needsReview.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-band">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <Link
                      href={`/products/${product.slug}?tab=reviews`}
                      className="mt-1.5 inline-flex rounded-lg bg-dark px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                      Write Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {active === "Reviewed Products" &&
          (reviewed.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">You haven&apos;t reviewed any products yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviewed.map((review) => (
                <div
                  key={review.id}
                  className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-band">
                    <Image src={review.product.imageUrl} alt={review.product.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${review.product.slug}`}
                      className="truncate text-sm font-medium hover:text-brand"
                    >
                      {review.product.name}
                    </Link>
                    <StarRating rating={review.rating} />
                    {review.comment && (
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
