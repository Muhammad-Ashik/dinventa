"use client";

import { useState } from "react";
import { ReviewList } from "@/components/review-list";
import { ReviewForm } from "@/components/review-form";

const TABS = ["Description", "Additional Information", "Reviews"] as const;
type Review = Parameters<typeof ReviewList>[0]["reviews"][number];

export function ProductDetailTabs({
  description,
  additionalInfo,
  reviews,
  canReview,
  productSlug,
  productId,
}: {
  description: string;
  additionalInfo: { label: string; value: string }[];
  reviews: Review[];
  canReview: boolean;
  productSlug: string;
  productId: string;
}) {
  const [active, setActive] = useState<(typeof TABS)[number]>("Description");

  return (
    <div className="rounded-2xl bg-band p-6 sm:p-10">
      <div className="flex flex-wrap gap-6 border-b border-neutral-200 pb-4 dark:border-neutral-700">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`text-base font-medium transition-colors ${
              active === tab
                ? "text-brand"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {tab === "Reviews" ? `Reviews (${reviews.length})` : tab}
          </button>
        ))}
      </div>

      <div className="pt-8">
        {active === "Description" && (
          <p className="max-w-3xl leading-relaxed whitespace-pre-line text-neutral-700 dark:text-neutral-300">
            {description}
          </p>
        )}

        {active === "Additional Information" && (
          <table className="w-full max-w-2xl text-sm">
            <tbody>
              {additionalInfo.map(({ label, value }) => (
                <tr key={label} className="border-b border-neutral-200 last:border-0 dark:border-neutral-700">
                  <td className="py-3 pr-6 font-medium text-neutral-500 dark:text-neutral-400">{label}</td>
                  <td className="py-3 text-neutral-900 dark:text-neutral-100">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {active === "Reviews" && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <ReviewList reviews={reviews} />
            <div>{canReview && <ReviewForm productSlug={productSlug} productId={productId} />}</div>
          </div>
        )}
      </div>
    </div>
  );
}
