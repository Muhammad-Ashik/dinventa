import { getCategories, getProducts, parseProductFilters } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseProductFilters(resolvedSearchParams);

  const [products, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Products</h1>

      <form method="get" className="flex flex-wrap items-end gap-3 text-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="q">Search</label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q}
            placeholder="e.g. mechanical keyboard"
            className="rounded border px-2 py-1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="rounded border px-2 py-1"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="minPrice">Min price (BDT)</label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            defaultValue={filters.minPrice}
            className="w-28 rounded border px-2 py-1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="maxPrice">Max price (BDT)</label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            defaultValue={filters.maxPrice}
            className="w-28 rounded border px-2 py-1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sort">Sort</label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort ?? "newest"}
            className="rounded border px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        <button type="submit" className="rounded bg-black px-4 py-1.5 text-white">
          Apply
        </button>
      </form>

      {products.length === 0 ? (
        <p className="text-neutral-600">No products match your filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
