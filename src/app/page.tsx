import Link from "next/link";
import { getCategories, getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { HeroSlider } from "@/components/hero-slider";
import { AiSearchHero } from "@/components/ai-search-hero";

const PER_SECTION = 4;

export default async function HomePage() {
  const categories = await getCategories();

  const [trending, ...byCategory] = await Promise.all([
    getProducts({ sort: "newest" }),
    ...categories.map((c) => getProducts({ category: c.slug, sort: "newest" })),
  ]);

  const categorySections = categories
    .map((c, i) => ({ category: c, products: byCategory[i].slice(0, PER_SECTION) }))
    .filter((s) => s.products.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <HeroSlider />

      <AiSearchHero />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-lg font-bold">
            <span>🔥</span> Trending Products
          </h2>
          <Link
            href="/products?sort=newest"
            className="text-sm font-medium text-brand transition-colors hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {trending.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {categorySections.map(({ category, products }) => (
        <section key={category.id}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{category.name}</h2>
            <Link
              href={`/products?category=${category.slug}`}
              className="text-sm font-medium text-brand transition-colors hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
