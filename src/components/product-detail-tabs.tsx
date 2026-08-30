"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DocumentTextIcon,
  InformationCircleIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { ReviewList } from "@/components/review-list";
import { ReviewForm } from "@/components/review-form";

// "Details" rather than "Additional Information" — the longer label was the
// one thing forcing this row to wrap on narrow phones (3 tabs, one running
// long) no matter how small the text got.
const TABS = ["Description", "Details", "Reviews"] as const;
const TAB_ICONS = {
  Description: DocumentTextIcon,
  Details: InformationCircleIcon,
  Reviews: ChatBubbleLeftEllipsisIcon,
} as const;
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
  // Lets links like the "Write Review" button on /account/reviews land
  // straight on the Reviews tab instead of Description.
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "reviews" ? "Reviews" : "Description";
  const [active, setActive] = useState<(typeof TABS)[number]>(initialTab);

  return (
    // Full-bleed grey band, matching the same -mt-8-less version of the
    // page-canvas technique used for /cart, /products, etc. — this section
    // sits mid-page (not at the very top), so only the horizontal bleed is
    // needed, not the top/bottom margin cancellation.
    <div className="relative left-1/2 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex gap-3 border-b border-neutral-200 pb-4 sm:gap-6 dark:border-neutral-700">
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                className={`flex shrink-0 items-center gap-1 text-sm font-medium whitespace-nowrap transition-colors sm:gap-1.5 sm:text-base ${
                  active === tab
                    ? "text-brand"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
              >
                <Icon className="size-4 sm:size-4.5" />
                {tab === "Reviews" ? `Reviews (${reviews.length})` : tab}
              </button>
            );
          })}
        </div>

        <div className="pt-6 sm:pt-8">
          {active === "Description" && (
            <p className="max-w-3xl leading-relaxed whitespace-pre-line text-neutral-700 dark:text-neutral-300">
              {description}
            </p>
          )}

          {active === "Details" && (
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
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              <ReviewList reviews={reviews} />
              <div>{canReview && <ReviewForm productSlug={productSlug} productId={productId} />}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
