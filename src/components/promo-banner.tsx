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
      className={`flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[#F3F4F6] text-neutral-900 ${compact ? "p-6" : "flex-col p-8 sm:flex-row"}`}
    >
      <div>
        <p className={`font-medium text-neutral-500 ${compact ? "text-sm" : "text-base"}`}>
          {product.category.name}
        </p>
        <h2 className={`mt-1.5 font-bold ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
          {product.name}
        </h2>
        <p className={`mt-1 font-medium text-brand ${compact ? "text-base" : "mt-2 text-lg"}`}>
          Up to {discountPercent}% off
        </p>
        <Link
          href={`/products/${product.slug}`}
          className={`mt-4 inline-flex rounded-lg text-sm font-medium text-white transition-colors ${
            compact ? "bg-dark px-5 py-2.5 hover:bg-brand-dark" : "bg-brand px-6 py-3 hover:bg-brand-dark"
          }`}
        >
          {compact ? "Grab the deal" : "Shop Now"}
        </Link>
      </div>
      <div className={`relative shrink-0 ${compact ? "size-24" : "size-48 sm:size-56"}`}>
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
