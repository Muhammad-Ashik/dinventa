import Link from "next/link";
import { StarRating } from "@/components/star-rating";

type FeaturedReview = {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string };
  product: { name: string; slug: string };
};

// Only ever real reviews from customers whose order actually shipped (see
// canReviewProduct in src/lib/reviews.ts) — renders nothing when there are
// none yet, same honest-empty pattern as the deals rail.
export function CustomerReviews({ reviews }: { reviews: FeaturedReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-bold sm:mb-8 sm:text-2xl">What customers are saying</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-8">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl bg-band p-5 sm:p-7">
            <StarRating rating={review.rating} />
            {review.comment && (
              <p className="mt-4 line-clamp-4 text-base text-neutral-700 dark:text-neutral-300">{review.comment}</p>
            )}
            <div className="mt-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-light text-base font-bold text-brand">
                {review.user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-base font-semibold">{review.user.name}</p>
                <Link
                  href={`/products/${review.product.slug}`}
                  className="text-sm text-neutral-500 hover:text-brand dark:text-neutral-400"
                >
                  Verified buyer · {review.product.name}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
