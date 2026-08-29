import Image from "next/image";
import Link from "next/link";

// Always built from a real on-sale product's actual data (name, category,
// real discount %) — never a fabricated "30% OFF" claim with nothing behind
// it. Renders nothing useful if there's no real deal to show; callers
// should only render this when a qualifying product exists.
export function PromoBanner({
  product,
  discountPercent,
  compact = false,
}: {
  product: { slug: string; name: string; category: { name: string }; imageUrl: string };
  discountPercent: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-band text-neutral-900 sm:gap-6 dark:text-neutral-100 ${compact ? "p-5 sm:p-7" : "flex-col p-6 sm:flex-row sm:p-10"}`}
    >
      <div>
        <p className={`font-medium text-neutral-500 dark:text-neutral-400 ${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}>
          {product.category.name}
        </p>
        <h2 className={`mt-2 font-bold ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-4xl"}`}>
          {product.name}
        </h2>
        <p className={`mt-1.5 font-medium text-brand ${compact ? "text-base sm:text-lg" : "text-lg sm:mt-3 sm:text-xl"}`}>
          Up to {discountPercent}% off
        </p>
        <Link
          href={`/products/${product.slug}`}
          className={`mt-5 inline-flex rounded-lg text-sm font-medium text-white transition-colors sm:text-base ${
            compact ? "bg-dark px-4 py-2.5 hover:bg-brand-dark sm:px-6 sm:py-3" : "bg-brand px-5 py-3 hover:bg-brand-dark sm:px-7 sm:py-3.5"
          }`}
        >
          {compact ? "Grab the deal" : "Shop Now"}
        </Link>
      </div>
      <div className={`relative shrink-0 ${compact ? "size-20 sm:size-28" : "size-36 sm:size-52 lg:size-64"}`}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="rounded object-contain"
          sizes="224px"
        />
      </div>
    </div>
  );
}
