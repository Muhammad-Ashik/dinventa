import Link from "next/link";
import { getBrands, getCategories, getProducts, parseProductFilters } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

const PRICE_PRESETS = [
  { label: "Under ৳500", min: undefined, max: 500 },
  { label: "৳500 – ৳1,000", min: 500, max: 1000 },
  { label: "৳1,000 – ৳5,000", min: 1000, max: 5000 },
  { label: "Above ৳5,000", min: 5000, max: undefined },
];

const SORT_OPTIONS: { value: "newest" | "price_asc" | "price_desc"; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseProductFilters(resolvedSearchParams);

  const [products, categories, brands] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
  ]);

  // Builds a query string starting from the current filters, with the given
  // overrides applied — used for the plain-link controls (sort, price
  // presets) so clicking one doesn't wipe out the rest of the filter state.
  function hrefWith(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      q: filters.q,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock ? "1" : undefined,
      sort: filters.sort,
      ...overrides,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value === undefined || value === "") continue;
      params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Products</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <form
          method="get"
          className="flex h-fit flex-col gap-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="q" className="font-semibold">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={filters.q}
              placeholder="e.g. mechanical keyboard"
              className="rounded border border-neutral-300 bg-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-semibold">Category</span>
            <Link
              href={hrefWith({ category: undefined })}
              className={!filters.category ? "font-medium text-brand" : "text-neutral-700 hover:text-brand"}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={hrefWith({ category: c.slug })}
                className={
                  filters.category === c.slug
                    ? "font-medium text-brand"
                    : "text-neutral-700 hover:text-brand"
                }
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="brand" className="font-semibold">
              Brand
            </label>
            <select
              id="brand"
              name="brand"
              defaultValue={filters.brand ?? ""}
              className="rounded border border-neutral-300 bg-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-semibold">Price range</span>
            <div className="flex flex-col gap-1">
              {PRICE_PRESETS.map((preset) => {
                const active = filters.minPrice === preset.min && filters.maxPrice === preset.max;
                return (
                  <Link
                    key={preset.label}
                    href={hrefWith({ minPrice: preset.min, maxPrice: preset.max })}
                    className={active ? "font-medium text-brand" : "text-neutral-700 hover:text-brand"}
                  >
                    {preset.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <input
                name="minPrice"
                type="number"
                min={0}
                placeholder="Min"
                defaultValue={filters.minPrice}
                className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <span className="text-neutral-400">–</span>
              <input
                name="maxPrice"
                type="number"
                min={0}
                placeholder="Max"
                defaultValue={filters.maxPrice}
                className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="inStock"
              value="1"
              defaultChecked={filters.inStock}
              className="size-4 accent-brand"
            />
            In stock only
          </label>

          {/* Preserve sort across a filter-form submit — the sort links below
              are separate GET navigations, so this form needs to carry the
              current sort forward instead of resetting it. */}
          {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}

          <button
            type="submit"
            className="rounded bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Apply filters
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">{products.length} products</p>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-neutral-500">Sort:</span>
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={hrefWith({ sort: opt.value })}
                  className={
                    (filters.sort ?? "newest") === opt.value
                      ? "rounded px-2 py-1 font-medium text-brand"
                      : "rounded px-2 py-1 text-neutral-600 hover:text-brand"
                  }
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <p className="text-neutral-600">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
