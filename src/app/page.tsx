import Link from "next/link";
import { getCategories, getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { HeroSlider } from "@/components/hero-slider";
import { AiSearchHero } from "@/components/ai-search-hero";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ sort: "newest" }),
    getCategories(),
  ]);
  const featured = products.slice(0, 12);

  return (
    <div className="flex flex-col gap-8">
      <HeroSlider />

      <AiSearchHero />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-4 text-center text-xs font-medium transition-colors hover:border-brand hover:text-brand active:bg-neutral-50"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">New Arrivals</h2>
          <Link href="/products" className="text-sm font-medium text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
