import Link from "next/link";
import { getBrands, getCategories, getProducts, parseProductFilters } from "@/lib/products";
import { getOptionalSession } from "@/lib/dal";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";
import { DropdownFilter } from "@/components/dropdown-filter";
import { Breadcrumbs } from "@/components/breadcrumbs";

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

  const [products, categories, brands, session] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
    getOptionalSession(),
  ]);
  const wishlisted = await getWishlistedProductIds(session?.userId);
  const isLoggedIn = !!session;

  const activeCategory = categories.find((c) => c.slug === filters.category);
  const hasPriceFilter = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const currentSort = SORT_OPTIONS.find((o) => o.value === (filters.sort ?? "newest"))!;

  // Builds a query string starting from the current filters, with the given
  // overrides applied — every dropdown link uses this so picking one filter
  // never wipes out the others.
  function hrefWith(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      q: filters.q,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock ? "1" : undefined,
      onSale: filters.onSale ? "1" : undefined,
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

  const filterLinkClass = (isActive: boolean) =>
    isActive
      ? "block rounded px-2 py-1.5 font-medium text-brand"
      : "block rounded px-2 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand";

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs
        items={activeCategory ? [{ label: activeCategory.name }] : [{ label: "Products" }]}
      />
      <h1 className="text-2xl font-bold">{activeCategory ? activeCategory.name : "Products"}</h1>

      <div className="flex flex-wrap items-center gap-3 border-y border-neutral-200 py-3">
        <DropdownFilter label="Category" active={!!filters.category}>
          <Link href={hrefWith({ category: undefined })} className={filterLinkClass(!filters.category)}>
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={hrefWith({ category: c.slug })}
              className={filterLinkClass(filters.category === c.slug)}
            >
              {c.name}
            </Link>
          ))}
        </DropdownFilter>

        <DropdownFilter label="Brand" active={!!filters.brand}>
          <Link href={hrefWith({ brand: undefined })} className={filterLinkClass(!filters.brand)}>
            All brands
          </Link>
          {brands.map((b) => (
            <Link key={b} href={hrefWith({ brand: b })} className={filterLinkClass(filters.brand === b)}>
              {b}
            </Link>
          ))}
        </DropdownFilter>

        <DropdownFilter label="Price" active={hasPriceFilter} panelClassName="w-72">
          <div className="flex flex-col">
            {PRICE_PRESETS.map((preset) => (
              <Link
                key={preset.label}
                href={hrefWith({ minPrice: preset.min, maxPrice: preset.max })}
                className={filterLinkClass(
                  filters.minPrice === preset.min && filters.maxPrice === preset.max
                )}
              >
                {preset.label}
              </Link>
            ))}
          </div>
          <form method="get" className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
            {filters.q && <input type="hidden" name="q" value={filters.q} />}
            {filters.category && <input type="hidden" name="category" value={filters.category} />}
            {filters.brand && <input type="hidden" name="brand" value={filters.brand} />}
            {filters.inStock && <input type="hidden" name="inStock" value="1" />}
            {filters.onSale && <input type="hidden" name="onSale" value="1" />}
            {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
            <input
              name="minPrice"
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={filters.minPrice}
              className="w-full rounded border border-neutral-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <span className="text-neutral-400">–</span>
            <input
              name="maxPrice"
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={filters.maxPrice}
              className="w-full rounded border border-neutral-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              type="submit"
              className="rounded bg-brand px-3 py-1.5 text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
            >
              Go
            </button>
          </form>
        </DropdownFilter>

        <Link
          href={hrefWith({ inStock: filters.inStock ? undefined : "1" })}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            filters.inStock
              ? "border-brand bg-brand-light text-brand"
              : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
          }`}
        >
          In stock only
        </Link>

        <Link
          href={hrefWith({ onSale: filters.onSale ? undefined : "1" })}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            filters.onSale
              ? "border-brand bg-brand-light text-brand"
              : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
          }`}
        >
          On Sale
        </Link>

        <div className="ml-auto">
          <DropdownFilter label={`Sort: ${currentSort.label}`}>
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={hrefWith({ sort: opt.value })}
                className={filterLinkClass((filters.sort ?? "newest") === opt.value)}
              >
                {opt.label}
              </Link>
            ))}
          </DropdownFilter>
        </div>
      </div>

      <p className="text-sm text-neutral-500">{products.length} products</p>

      {products.length === 0 ? (
        <p className="text-neutral-600">No products match your filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlisted.has(product.id)}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
