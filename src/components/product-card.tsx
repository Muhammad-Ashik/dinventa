import Link from "next/link";
import { formatBDT } from "@/lib/money";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { QuickViewTrigger } from "@/components/quick-view-trigger";

export function ProductCard({
  product,
  isWishlisted = false,
  isLoggedIn = false,
  bare = false,
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
  // Homepage listing blocks (New Arrivals, category rows) put the same
  // --color-band grey that used to sit behind the whole block onto each
  // card instead — the heading/View All row stays on the plain page
  // background. Every other grid (/products, /wishlist, related products)
  // keeps the plain white card.
  bare?: boolean;
}) {
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const gallery = product.images.length > 0 ? product.images : [product.imageUrl];
  const cardBg = bare ? "bg-band" : "bg-white dark:bg-surface";
  // Bare (homepage) cards bleed the image to the card's own edges — padding
  // only starts below it, around the text/buttons — instead of insetting
  // the image like a framed photo the way the white-card variant still
  // does elsewhere (/products, /wishlist, related products).
  const imageWrapClass = bare ? "" : "p-3 pb-0 sm:p-4 sm:pb-0";
  const imageRadiusClass = bare ? "rounded-t-xl" : "rounded-lg";

  return (
    // `group` isn't used directly in this file anymore (the old hover-reveal
    // action row is gone), but ProductImageGallery's image zoom and
    // drag-hint hand icon are both `group-hover:`-driven and need an
    // ancestor with this class to ever fire.
    <div className={`group flex flex-col overflow-hidden rounded-xl ${cardBg}`}>
      <div className={imageWrapClass}>
        <div
          className={`relative mb-2 flex aspect-square w-full items-center justify-center overflow-hidden sm:mb-4 ${imageRadiusClass}`}
        >
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
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 sm:px-4 sm:pb-4">
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

        {product.stock > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <BuyNowButton
              productId={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
            />
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
            />
            <QuickViewTrigger
              product={{ ...product, images: gallery }}
              isWishlisted={isWishlisted}
              isLoggedIn={isLoggedIn}
            />
          </div>
        )}
      </div>
    </div>
  );
}
