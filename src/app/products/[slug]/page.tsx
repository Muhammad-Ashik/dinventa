import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";
import { getOptionalSession } from "@/lib/dal";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { AddToCartWithQuantity } from "@/components/add-to-cart-with-quantity";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { ProductDetailGallery } from "@/components/product-detail-gallery";
import { WishlistButton } from "@/components/wishlist-button";
import { StarRating } from "@/components/star-rating";
import { ProductDetailTabs } from "@/components/product-detail-tabs";
import { TrustBadges } from "@/components/trust-badges";
import { canReviewProduct, getProductRatingSummary, getProductReviews } from "@/lib/reviews";

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const [relatedProducts, session, reviews, ratingSummary] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: product.categoryId, status: "ACTIVE", id: { not: product.id } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    getOptionalSession(),
    getProductReviews(product.id),
    getProductRatingSummary(product.id),
  ]);
  const wishlisted = await getWishlistedProductIds(session?.userId);
  const canReview = session ? await canReviewProduct(session.userId, product.id) : false;
  const isLoggedIn = !!session;
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: product.category.name, href: `/products?category=${product.category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2">
          <ProductDetailGallery
            images={product.images.length > 0 ? product.images : [product.imageUrl]}
            alt={product.name}
          />

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
                {onSale && (
                  <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                <span>{product.category.name}</span>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <span>{product.brand}</span>
              </p>
              {ratingSummary.count > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={ratingSummary.average} />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {ratingSummary.average.toFixed(1)} ({ratingSummary.count} review
                    {ratingSummary.count === 1 ? "" : "s"})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-brand sm:text-3xl">{formatBDT(product.price)}</p>
              {onSale && (
                <p className="text-lg text-neutral-400 line-through dark:text-neutral-500">
                  {formatBDT(product.compareAtPrice!)}
                </p>
              )}
              <span
                className={
                  product.stock > 0
                    ? "inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : "inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400"
                }
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {product.stock > 0 ? (
              <div className="pt-1">
                <AddToCartWithQuantity
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  maxQuantity={product.stock}
                  isWishlisted={wishlisted.has(product.id)}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            ) : (
              // Add to Cart is gone entirely once out of stock, but the
              // wishlist toggle still needs to live somewhere — it was
              // otherwise only reachable via AddToCartWithQuantity above.
              <div className="pt-1">
                <WishlistButton
                  productId={product.id}
                  initialWishlisted={wishlisted.has(product.id)}
                  isLoggedIn={isLoggedIn}
                  className="flex w-fit items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-300"
                />
              </div>
            )}

            <TrustBadges className="mt-2" />
          </div>
        </div>
      </div>

      <ProductDetailTabs
        description={product.description}
        additionalInfo={[
          { label: "Brand", value: product.brand },
          { label: "Category", value: product.category.name },
          { label: "Availability", value: product.stock > 0 ? "In stock" : "Out of stock" },
          {
            label: "Added",
            value: product.createdAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          },
        ]}
        reviews={reviews}
        canReview={canReview}
        productSlug={product.slug}
        productId={product.id}
      />

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">You might also like</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-4 sm:gap-y-10">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={wishlisted.has(p.id)}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
