import Link from "next/link";
import { formatBDT } from "@/lib/money";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { QuickViewTrigger } from "@/components/quick-view-trigger";

export function ProductCard({
  product,
  isWishlisted = false,
  isLoggedIn = false,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string;
    images: string[];
    stock: number;
    brand: string;
    category: { name: string };
  };
  isWishlisted?: boolean;
  isLoggedIn?: boolean;
}) {
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const gallery = product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <div className="group flex flex-col">
      <div className="relative mb-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-band">
        <ProductImageGallery
          images={gallery}
          alt={product.name}
          href={`/products/${product.slug}`}
          imgClassName="object-cover"
        />

        <div className="absolute top-2 left-2 z-10">
          <WishlistButton
            productId={product.id}
            initialWishlisted={isWishlisted}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {product.stock === 0 ? (
          <span className="absolute top-2 right-2 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-medium text-white dark:bg-red-500">
            Out of Stock
          </span>
        ) : (
          onSale && (
            <span className="absolute top-2 right-2 z-10 rounded-full bg-brand px-2 py-1 text-xs font-medium text-white">
              {discountPercent}% OFF
            </span>
          )
        )}

        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 pb-4 duration-200 ease-linear group-hover:translate-y-0">
          <QuickViewTrigger
            product={{ ...product, images: gallery }}
            isWishlisted={isWishlisted}
            isLoggedIn={isLoggedIn}
          />
          <AddToCartButton
            productId={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
          />
        </div>
      </div>

      {/* flex-1 (not just a plain block) so this stretches to fill whatever
          extra height the grid row's tallest sibling forces onto this card
          (CSS Grid's default align-items: stretch already does that for the
          card as a whole) — then mt-auto on the price pins it to the very
          bottom of that space, so price/buttons line up across a row
          regardless of how many lines a given title wraps to. Title is
          never truncated (no line-clamp): cutting it off mid-word was the
          actual problem, not the row-height side effect of not doing so. */}
      <div className="flex flex-1 flex-col">
        <Link
          href={`/products/${product.slug}`}
          className="mb-1.5 text-sm font-semibold text-neutral-900 transition-colors hover:text-brand sm:mb-2 sm:text-lg dark:text-neutral-100"
        >
          {product.name}
        </Link>
        <p className="mt-auto flex items-center gap-2 text-sm font-semibold sm:text-lg sm:font-medium">
          {onSale && (
            <span className="text-neutral-400 font-normal line-through dark:text-neutral-500">
              {formatBDT(product.compareAtPrice!)}
            </span>
          )}
          <span className="text-brand">{formatBDT(product.price)}</span>
        </p>
      </div>
    </div>
  );
}
