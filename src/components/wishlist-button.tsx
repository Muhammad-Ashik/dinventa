"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { toggleWishlist } from "@/lib/actions/wishlist";

export function WishlistButton({
  productId,
  initialWishlisted,
  isLoggedIn,
}: {
  productId: string;
  initialWishlisted: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    // The button sits as a sibling overlay on top of the card's image Link
    // (not nested inside it — a <button> inside an <a> is invalid HTML and
    // would double-fire navigation), but stop propagation anyway in case
    // that ever changes.
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setWishlisted((w) => !w);
    startTransition(async () => {
      await toggleWishlist(productId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed"
    >
      {wishlisted ? (
        <HeartSolid className="size-4 text-brand" />
      ) : (
        <HeartOutline className="size-4 text-neutral-600" />
      )}
    </button>
  );
}
