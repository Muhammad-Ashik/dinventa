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
      className={`flex items-center justify-between gap-6 overflow-hidden rounded-2xl bg-surface-muted text-neutral-900 dark:text-neutral-100 ${compact ? "p-7" : "flex-col p-10 sm:flex-row"}`}
    >
      <div>
        <p className={`font-medium text-neutral-500 dark:text-neutral-400 ${compact ? "text-base" : "text-lg"}`}>
          {product.category.name}
        </p>
        <h2 className={`mt-2 font-bold ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}>
          {product.name}
        </h2>
        <p className={`mt-1.5 font-medium text-brand ${compact ? "text-lg" : "mt-3 text-xl"}`}>
          Up to {discountPercent}% off
        </p>
        <Link
          href={`/products/${product.slug}`}
          className={`mt-5 inline-flex rounded-lg text-base font-medium text-white transition-colors ${
            compact ? "bg-dark px-6 py-3 hover:bg-brand-dark" : "bg-brand px-7 py-3.5 hover:bg-brand-dark"
          }`}
        >
          {compact ? "Grab the deal" : "Shop Now"}
        </Link>
      </div>
      <div className={`relative shrink-0 ${compact ? "size-28" : "size-52 sm:size-64"}`}>
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
