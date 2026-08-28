import { StarRating } from "@/components/star-rating";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string };
};

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-neutral-500">No reviews yet — be the first to leave one.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-3 border-b border-neutral-100 pb-4 last:border-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
            {review.user.name.charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{review.user.name}</p>
              <StarRating rating={review.rating} size="size-3.5" />
            </div>
            {review.comment && <p className="text-sm text-neutral-700">{review.comment}</p>}
            <p className="text-xs text-neutral-400">
              {new Date(review.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
