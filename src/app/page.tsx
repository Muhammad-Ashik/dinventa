import Link from "next/link";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const products = await getProducts({ sort: "newest" });
  const featured = products.slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome to Dinventa</h1>
        <p className="text-neutral-600">
          Browse the catalog, or head to{" "}
          <Link href="/products" className="underline">
            all products
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
