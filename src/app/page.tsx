import { FireIcon, StarIcon } from "@heroicons/react/20/solid";
import { categoryIcon } from "@/lib/category-icons";
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
      ...categories.map((c) => getProducts({ category: [c.slug], sort: "newest" })),
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
    <div className="flex flex-col gap-8 sm:gap-14">
      <div className="relative left-1/2 -mt-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="min-w-0 lg:basis-[70%]">
              <HeroSlider deals={heroDeals} />
            </div>
            {/* Hidden on mobile — the global AiSearchBubble (mounted in
                layout.tsx) replaces this inline panel there, since a
                full-height "Ask AI" card pushed below a phone's hero slider
                just adds scrolling before New Arrivals is even visible. */}
            <div className="hidden min-w-0 lg:flex lg:basis-[30%]">
              <AiSearchHero />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between gap-2">
          <h2 className="flex min-w-0 items-center gap-1.5 text-base font-bold sm:gap-2 sm:text-xl md:text-2xl">
            <FireIcon className="size-5 shrink-0 text-brand sm:size-6" /> New Arrivals
          </h2>
          <ViewAllButton href="/products?sort=newest" />
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3 sm:gap-y-10 lg:grid-cols-4">
          {newArrivals.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} bare {...cardProps(product)} />
          ))}
        </div>
      </div>

      {bannerDeal && (
        <PromoBanner product={bannerDeal} discountPercent={discountPercentOf(bannerDeal)} />
      )}

      {compactDeals.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {compactDeals.map((p) => (
            <PromoBanner key={p.id} product={p} discountPercent={discountPercentOf(p)} compact />
          ))}
        </div>
      )}

      {bestSellers.length > 0 && (
        <section className="flex flex-col items-center">
          <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <StarIcon className="size-6 text-brand" /> Best Selling Products
          </h2>
          <p className="mt-2 max-w-md text-center text-base text-neutral-500 sm:text-lg dark:text-neutral-400">
            The products our customers actually order the most — ranked by real order counts,
            not a guess.
          </p>
          <div className="mt-6 grid w-full grid-cols-1 gap-6 sm:mt-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {bestSellers.map((product) => (
              <BestSellerCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-6 sm:mt-8">
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

      {categorySections.map(({ category, products }) => {
        const CategoryIcon = categoryIcon(category.slug);
        return (
          <div key={category.id}>
            <div className="mb-6 flex items-center justify-between gap-2">
              <h2 className="flex min-w-0 items-center gap-1.5 text-base font-bold sm:gap-2 sm:text-xl md:text-2xl">
                <CategoryIcon className="size-5 shrink-0 text-brand sm:size-6" /> {category.name}
              </h2>
              <ViewAllButton href={`/products?category=${category.slug}`} />
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-4 sm:gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} bare {...cardProps(product)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
