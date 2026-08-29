import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  getBrandCounts,
  getCategories,
  getCategoryCounts,
  getProductsPaged,
  parseProductFilters,
  type ProductSort,
} from "@/lib/products";
import { getOptionalSession } from "@/lib/dal";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";
import { DropdownFilter } from "@/components/dropdown-filter";
import { FilterSection } from "@/components/filter-section";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AiSearchBar } from "@/components/ai-search-bar";

function toggle(list: string[] | undefined, value: string): string[] | undefined {
  const next = list?.includes(value) ? list.filter((v) => v !== value) : [...(list ?? []), value];
  return next.length > 0 ? next : undefined;
}

// Shared by /products and /popular — same sidebar filters, sort, grid and
// pagination on both; the only differences are the base path, the default
// sort, and the fallback heading when no category is selected.
export async function ProductListingPage({
  basePath,
  baseLabel,
  defaultSort,
  pageSize,
  sortOptions,
  searchParams,
}: {
  basePath: string;
  baseLabel: string;
  defaultSort: ProductSort;
  pageSize: number;
  sortOptions: { value: ProductSort; label: string }[];
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseProductFilters(searchParams);
  filters.sort = filters.sort ?? defaultSort;
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const page = Math.max(1, Number(rawPage) || 1);

  const [{ items: products, total }, categories, categoryCounts, brandCounts, session] =
    await Promise.all([
      getProductsPaged(filters, page, pageSize),
      getCategories(),
      getCategoryCounts(),
      getBrandCounts(),
      getOptionalSession(),
    ]);
  const wishlisted = await getWishlistedProductIds(session?.userId);
  const isLoggedIn = !!session;

  // Only collapse the heading down to a single category name when exactly
  // one is selected — with real multi-select, "Electronics + Fashion" has
  // no single good heading, so it falls back to the page's own label.
  const activeCategory =
    filters.category?.length === 1 ? categories.find((c) => c.slug === filters.category![0]) : undefined;
  const brands = Object.keys(brandCounts).sort();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentSort = sortOptions.find((o) => o.value === filters.sort)!;
  const hasAnyFilter = !!(
    filters.category?.length ||
    filters.brand?.length ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock ||
    filters.onSale
  );

  // Builds a query string starting from the current filters, with the given
  // overrides applied — every filter link uses this so picking one never
  // wipes out the others. Array values (category/brand) become repeated
  // params (?category=a&category=b), matching what parseProductFilters
  // reads back.
  function hrefWith(overrides: Record<string, string | number | string[] | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | string[] | undefined> = {
      q: filters.q,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock ? "1" : undefined,
      onSale: filters.onSale ? "1" : undefined,
      sort: filters.sort === defaultSort ? undefined : filters.sort,
      page,
      ...overrides,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value === undefined || value === "" || (key === "page" && value === 1)) continue;
      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        for (const v of value) params.append(key, v);
      } else {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const checkboxRowClass =
    "flex items-start gap-2 rounded px-1.5 py-1 text-sm text-neutral-700 transition-colors hover:text-brand dark:text-neutral-300";
  const checkboxClass =
    "mt-0.5 size-4 shrink-0 rounded border-neutral-300 text-brand accent-brand focus:ring-brand dark:border-neutral-600";

  const sortLinkClass = (isActive: boolean) =>
    isActive
      ? "block rounded px-2 py-1.5 font-medium text-brand"
      : "block rounded px-2 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800";

  const pageLinkClass = (isActive: boolean) =>
    `flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
      isActive
        ? "border-brand bg-brand text-white"
        : "border-neutral-200 text-neutral-700 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-300"
    }`;

  return (
    // Full-bleed grey band for the whole shop-with-sidebar page (matching the
    // reference), independent of the site's normal white page background —
    // the -mt-8/-mb-8 cancel the root layout's <main> padding so this reaches
    // the header and footer edge-to-edge, then the inner wrapper restores it.
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4">
          <Breadcrumbs
            items={activeCategory ? [{ label: activeCategory.name }] : [{ label: baseLabel }]}
          />
          <h1 className="text-2xl font-bold">{activeCategory ? activeCategory.name : baseLabel}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-5 rounded-xl bg-white p-5 dark:bg-surface">
          <AiSearchBar />

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            {hasAnyFilter && (
              <Link
                href={basePath}
                className="text-sm font-medium text-brand transition-colors hover:underline"
              >
                Clear All
              </Link>
            )}
          </div>

          <FilterSection title="Category">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={hrefWith({ category: toggle(filters.category, c.slug), page: 1 })}
                className={checkboxRowClass}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={!!filters.category?.includes(c.slug)}
                  className={checkboxClass}
                />
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {categoryCounts[c.slug] ?? 0}
                </span>
              </Link>
            ))}
          </FilterSection>

          <FilterSection title="Brand">
            {brands.map((b) => (
              <Link
                key={b}
                href={hrefWith({ brand: toggle(filters.brand, b), page: 1 })}
                className={checkboxRowClass}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={!!filters.brand?.includes(b)}
                  className={checkboxClass}
                />
                <span className="flex-1">{b}</span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">{brandCounts[b]}</span>
              </Link>
            ))}
          </FilterSection>

          <FilterSection title="Price">
            <form method="get" action={basePath} className="flex items-center gap-2">
              {filters.q && <input type="hidden" name="q" value={filters.q} />}
              {filters.category?.map((c) => <input key={c} type="hidden" name="category" value={c} />)}
              {filters.brand?.map((b) => <input key={b} type="hidden" name="brand" value={b} />)}
              {filters.inStock && <input type="hidden" name="inStock" value="1" />}
              {filters.onSale && <input type="hidden" name="onSale" value="1" />}
              {filters.sort && filters.sort !== defaultSort && (
                <input type="hidden" name="sort" value={filters.sort} />
              )}
              <input
                name="minPrice"
                type="number"
                min={0}
                placeholder="Min"
                defaultValue={filters.minPrice}
                className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
              />
              <span className="text-neutral-400 dark:text-neutral-500">–</span>
              <input
                name="maxPrice"
                type="number"
                min={0}
                placeholder="Max"
                defaultValue={filters.maxPrice}
                className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button
                type="submit"
                className="shrink-0 rounded bg-brand px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
              >
                Go
              </button>
            </form>
          </FilterSection>

          <FilterSection title="Availability">
            <Link
              href={hrefWith({ inStock: filters.inStock ? undefined : "1", page: 1 })}
              className={checkboxRowClass}
            >
              <input type="checkbox" readOnly checked={!!filters.inStock} className={checkboxClass} />
              In stock only
            </Link>
            <Link
              href={hrefWith({ onSale: filters.onSale ? undefined : "1", page: 1 })}
              className={checkboxRowClass}
            >
              <input type="checkbox" readOnly checked={!!filters.onSale} className={checkboxClass} />
              On sale
            </Link>
          </FilterSection>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 dark:bg-surface">
            <DropdownFilter label={currentSort.label}>
              {sortOptions.map((opt) => (
                <Link
                  key={opt.value}
                  href={hrefWith({ sort: opt.value, page: 1 })}
                  className={sortLinkClass(filters.sort === opt.value)}
                >
                  {opt.label}
                </Link>
              ))}
            </DropdownFilter>

            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing {products.length} of {total} Products
            </p>
          </div>

          {products.length === 0 ? (
            <p className="text-neutral-600 dark:text-neutral-400">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
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

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Link
                href={hrefWith({ page: Math.max(1, page - 1) })}
                aria-disabled={page === 1}
                className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  page === 1
                    ? "pointer-events-none border-neutral-100 text-neutral-300 dark:border-neutral-800 dark:text-neutral-700"
                    : "border-neutral-200 text-neutral-700 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-300"
                }`}
              >
                <ChevronLeftIcon className="size-4" /> Previous
              </Link>

              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={hrefWith({ page: p })} className={pageLinkClass(p === page)}>
                  {p}
                </Link>
              ))}

              <Link
                href={hrefWith({ page: Math.min(pageCount, page + 1) })}
                aria-disabled={page === pageCount}
                className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  page === pageCount
                    ? "pointer-events-none border-neutral-100 text-neutral-300 dark:border-neutral-800 dark:text-neutral-700"
                    : "border-neutral-200 text-neutral-700 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-300"
                }`}
              >
                Next <ChevronRightIcon className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
