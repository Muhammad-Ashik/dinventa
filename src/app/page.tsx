import Link from "next/link";
import { getCategories, getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ sort: "newest" }),
    getCategories(),
  ]);
  const featured = products.slice(0, 12);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg bg-gradient-to-r from-brand to-brand-dark px-6 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="text-2xl font-bold sm:text-3xl">Smart shopping, made for Bangladesh</h1>
        <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
          Tell our AI what you&apos;re looking for, order with Cash on Delivery, and we&apos;ll
          call to confirm before it ships.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-block rounded bg-white px-5 py-2.5 text-sm font-semibold text-brand hover:bg-neutral-100"
        >
          Shop all products
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-4 text-center text-xs font-medium hover:border-brand hover:text-brand"
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
