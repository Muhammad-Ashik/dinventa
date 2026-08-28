import { notFound } from "next/navigation";
import { BanknotesIcon, PhoneIcon, TruckIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";
import { getOptionalSession } from "@/lib/dal";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { AddToCartWithQuantity } from "@/components/add-to-cart-with-quantity";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { StarRating } from "@/components/star-rating";
import { ReviewList } from "@/components/review-list";
import { ReviewForm } from "@/components/review-form";
import { canReviewProduct, getProductRatingSummary, getProductReviews } from "@/lib/reviews";

const TRUST_BADGES = [
  { Icon: BanknotesIcon, label: "Cash on Delivery" },
  { Icon: PhoneIcon, label: "We call to confirm your order" },
  { Icon: TruckIcon, label: "Nationwide delivery" },
];

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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: product.category.name, href: `/products?category=${product.category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F6F7FB]">
            <ProductImageGallery
              images={product.images.length > 0 ? product.images : [product.imageUrl]}
              alt={product.name}
              imgClassName="object-contain p-8"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <WishlistButton
              productId={product.id}
              initialWishlisted={wishlisted.has(product.id)}
              isLoggedIn={isLoggedIn}
            />
            {onSale && (
              <span className="absolute top-2 left-2 z-10 rounded bg-brand px-2 py-1 text-xs font-bold text-white">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                <span>{product.category.name}</span>
                <span className="text-neutral-300">•</span>
                <span>{product.brand}</span>
              </p>
              <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
              {ratingSummary.count > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={ratingSummary.average} />
                  <span className="text-sm text-neutral-500">
                    {ratingSummary.average.toFixed(1)} ({ratingSummary.count} review
                    {ratingSummary.count === 1 ? "" : "s"})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-brand">{formatBDT(product.price)}</p>
              {onSale && (
                <p className="text-lg text-neutral-400 line-through">
                  {formatBDT(product.compareAtPrice!)}
                </p>
              )}
              <span
                className={
                  product.stock > 0
                    ? "inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                    : "inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                }
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <p className="leading-relaxed text-neutral-700">{product.description}</p>

            {product.stock > 0 && (
              <div className="pt-1">
                <AddToCartWithQuantity
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  maxQuantity={product.stock}
                />
              </div>
            )}

            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              {TRUST_BADGES.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-neutral-700">
                  <Icon className="size-4 text-brand" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-bold">Reviews</h2>
          <ReviewList reviews={reviews} />
        </div>
        <div>
          {canReview && <ReviewForm productSlug={product.slug} productId={product.id} />}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
