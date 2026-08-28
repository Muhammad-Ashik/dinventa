import { FireIcon, StarIcon } from "@heroicons/react/20/solid";
import { getCategories, getProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { getOptionalSession } from "@/lib/dal";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";
import { HeroSlider } from "@/components/hero-slider";
import { AiSearchHero } from "@/components/ai-search-hero";
import { PromoBanner } from "@/components/promo-banner";
import { ViewAllButton } from "@/components/view-all-button";
import { BestSellerCard } from "@/components/best-seller-card";
import { CountdownPromo } from "@/components/countdown-promo";
import { CustomerReviews } from "@/components/customer-reviews";
import { getFeaturedReviews } from "@/lib/reviews";

const PER_SECTION = 4;

function discountPercentOf(product: { price: number; compareAtPrice: number | null }) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export default async function HomePage() {
  const [categories, session] = await Promise.all([getCategories(), getOptionalSession()]);
  const isLoggedIn = !!session;

  const [newArrivals, dealsRaw, bestSellers, wishlisted, flashDeal, featuredReviews, ...byCategory] =
    await Promise.all([
      getProducts({ sort: "newest" }),
      prisma.product.findMany({
        where: { status: "ACTIVE", compareAtPrice: { not: null } },
        include: { category: true },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        include: { category: true },
        orderBy: { orderItems: { _count: "desc" } },
        take: 6,
      }),
      getWishlistedProductIds(session?.userId),
      // A real, currently-running time-boxed sale — never rendered unless an
      // admin actually set a saleEndsAt in the future for a discounted product.
      prisma.product.findFirst({
        where: { status: "ACTIVE", compareAtPrice: { not: null }, saleEndsAt: { gt: new Date() } },
        orderBy: { saleEndsAt: "asc" },
      }),
      getFeaturedReviews(3),
      ...categories.map((c) => getProducts({ category: c.slug, sort: "newest" })),
    ]);

  const categorySections = categories
    .map((c, i) => ({ category: c, products: byCategory[i].slice(0, PER_SECTION) }))
    .filter((s) => s.products.length > 0);

  const deals = dealsRaw
    .filter((p) => discountPercentOf(p) > 0)
    .sort((a, b) => discountPercentOf(b) - discountPercentOf(a));
  // Distinct slices so the same product never shows up twice across the
  // hero slider, big banner, and compact promo row.
  const heroDeals = deals.slice(0, 3);
  const bannerDeal = deals[3];
  const compactDeals = deals.slice(4, 6);

  const cardProps = (p: { id: string }) => ({
    isWishlisted: wishlisted.has(p.id),
    isLoggedIn,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="relative left-1/2 -mt-6 w-screen -translate-x-1/2 bg-[#F7F7F7]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="min-w-0 lg:basis-[70%]">
              <HeroSlider deals={heroDeals} />
            </div>
            <div className="flex min-w-0 lg:basis-[30%]">
              <AiSearchHero />
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xl font-bold">
            <FireIcon className="size-5 text-brand" /> New Arrivals
          </h2>
          <ViewAllButton href="/products?sort=newest" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} {...cardProps(product)} />
          ))}
        </div>
      </section>

      {bannerDeal && (
        <PromoBanner product={bannerDeal} discountPercent={discountPercentOf(bannerDeal)} />
      )}

      {compactDeals.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {compactDeals.map((p) => (
            <PromoBanner key={p.id} product={p} discountPercent={discountPercentOf(p)} compact />
          ))}
        </div>
      )}

      {bestSellers.length > 0 && (
        <section className="flex flex-col items-center">
          <h2 className="flex items-center gap-1.5 text-2xl font-bold">
            <StarIcon className="size-5 text-brand" /> Best Selling Products
          </h2>
          <p className="mt-1 max-w-md text-center text-base text-neutral-500">
            The products our customers actually order the most — ranked by real order counts,
            not a guess.
          </p>
          <div className="mt-6 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((product) => (
              <BestSellerCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-6">
            <ViewAllButton href="/products" />
          </div>
        </section>
      )}

      {flashDeal && (
        <CountdownPromo
          product={flashDeal}
          endsAt={flashDeal.saleEndsAt!.toISOString()}
        />
      )}

      <CustomerReviews reviews={featuredReviews} />

      {categorySections.map(({ category, products }) => (
        <section key={category.id}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{category.name}</h2>
            <ViewAllButton href={`/products?category=${category.slug}`} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} {...cardProps(product)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
