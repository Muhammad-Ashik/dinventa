import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

// Renders a fractional rating (e.g. 3.4) as a partially-filled star row —
// a solid-star overlay clipped to the exact percentage, over an outline
// baseline, rather than rounding to the nearest whole star.
export function StarRating({
  rating,
  size = "size-4",
}: {
  rating: number;
  size?: string;
}) {
  const percent = Math.max(0, Math.min(5, rating)) * 20;

  return (
    <span className="relative inline-flex" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="flex text-neutral-300 dark:text-neutral-600">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarOutline key={i} className={size} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden text-amber-400"
        style={{ width: `${percent}%` }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <StarSolid key={i} className={size} />
        ))}
      </span>
    </span>
  );
}
