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
      <h2 className="mb-6 text-center text-xl font-bold">What customers are saying</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl bg-[#F6F7FB] p-5">
            <StarRating rating={review.rating} />
            {review.comment && (
              <p className="mt-3 line-clamp-4 text-sm text-neutral-700">{review.comment}</p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                {review.user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold">{review.user.name}</p>
                <Link
                  href={`/products/${review.product.slug}`}
                  className="text-xs text-neutral-500 hover:text-brand"
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
