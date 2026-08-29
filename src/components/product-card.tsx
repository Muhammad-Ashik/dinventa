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

      <Link
        href={`/products/${product.slug}`}
        title={product.name}
        className="mb-2 line-clamp-1 text-lg font-semibold text-neutral-900 transition-colors hover:text-brand dark:text-neutral-100"
      >
        {product.name}
      </Link>
      <p className="flex items-center gap-2 text-lg font-medium">
        {onSale && (
          <span className="text-neutral-400 line-through dark:text-neutral-500">
            {formatBDT(product.compareAtPrice!)}
          </span>
        )}
        <span className="text-neutral-900 dark:text-neutral-100">{formatBDT(product.price)}</span>
      </p>
    </div>
  );
}
