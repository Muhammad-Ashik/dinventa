import type { ProductFilters, ProductSort } from "@/lib/products";

// Pure, framework-agnostic logic shared between ProductListingPage (a
// Server Component) and MobileFiltersDrawer (a Client Component) — neither
// "use client" nor "use server", so both can import it directly instead of
// each maintaining its own copy of the query-string-building rules.

// Builds a query string starting from the given filters, with overrides
// applied — every filter link uses this so picking one never wipes out the
// others. Array values (category/brand) become repeated params
// (?category=a&category=b), matching what parseProductFilters reads back.
export function buildFilterHref(
  basePath: string,
  filters: ProductFilters,
  defaultSort: ProductSort,
  page: number,
  overrides: Record<string, string | number | string[] | undefined>
): string {
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

export function toggleFilterValue(list: string[] | undefined, value: string): string[] | undefined {
  const next = list?.includes(value) ? list.filter((v) => v !== value) : [...(list ?? []), value];
  return next.length > 0 ? next : undefined;
}
