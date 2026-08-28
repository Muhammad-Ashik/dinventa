import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { getProductsPaged, parseProductFilters, type ProductSort } from "@/lib/products";
import { getOptionalSession } from "@/lib/dal";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";
import { DropdownFilter } from "@/components/dropdown-filter";
import { Breadcrumbs } from "@/components/breadcrumbs";

const PAGE_SIZE = 8;

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default async function PopularPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseProductFilters(resolvedSearchParams);
  // Real popularity is the default here (unlike /products, which defaults
  // to newest) — that's the whole point of this page.
  filters.sort = filters.sort ?? "popular";

  const rawPage = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const page = Math.max(1, Number(rawPage) || 1);

  const [{ items: products, total }, session] = await Promise.all([
    getProductsPaged(filters, page, PAGE_SIZE),
    getOptionalSession(),
  ]);
  const wishlisted = await getWishlistedProductIds(session?.userId);
  const isLoggedIn = !!session;

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentSort = SORT_OPTIONS.find((o) => o.value === filters.sort)!;

  function hrefWith(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      sort: filters.sort,
      page,
      ...overrides,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value === undefined || value === "" || (key === "page" && value === 1)) continue;
      params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `/popular?${qs}` : "/popular";
  }

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
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: "Popular" }]} />
      <h1 className="text-2xl font-bold">Popular</h1>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 py-3 dark:border-neutral-800">
        <DropdownFilter label={`Sort: ${currentSort.label}`}>
          {SORT_OPTIONS.map((opt) => (
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
          Showing {products.length} of {total} products
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">No products yet.</p>
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
  );
}
