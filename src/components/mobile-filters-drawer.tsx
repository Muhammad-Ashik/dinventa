"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FilterSection } from "@/components/filter-section";
import { buildFilterHref, toggleFilterValue } from "@/lib/filter-href";
import type { ProductFilters, ProductSort } from "@/lib/products";

const checkboxRowClass =
  "flex items-start gap-2 rounded px-1.5 py-1 text-sm text-neutral-700 transition-colors hover:text-brand dark:text-neutral-300";
const checkboxClass =
  "mt-0.5 size-4 shrink-0 rounded border-neutral-300 text-brand accent-brand focus:ring-brand dark:border-neutral-600";
const countBadgeClass =
  "min-w-5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-center text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";

// Mobile-only counterpart to the desktop <aside> + sort dropdown (both
// hidden below `lg` — see product-listing-page.tsx): rather than stacking
// Filters above the product grid (pushing every product below the fold),
// this collapses filtering AND sorting into one slide-in drawer triggered
// by a single compact button, matching the mobile nav drawer's pattern.
export function MobileFiltersDrawer({
  basePath,
  filters,
  defaultSort,
  page,
  categories,
  categoryCounts,
  brands,
  brandCounts,
  sortOptions,
  currentSortLabel,
  hasAnyFilter,
}: {
  basePath: string;
  filters: ProductFilters;
  defaultSort: ProductSort;
  page: number;
  categories: { id: string; name: string; slug: string }[];
  categoryCounts: Record<string, number>;
  brands: string[];
  brandCounts: Record<string, number>;
  sortOptions: { value: ProductSort; label: string }[];
  currentSortLabel: string;
  hasAnyFilter: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 180);
  }

  function hrefWith(overrides: Record<string, string | number | string[] | undefined>) {
    return buildFilterHref(basePath, filters, defaultSort, page, overrides);
  }

  const sortLinkClass = (isActive: boolean) =>
    isActive
      ? "block rounded px-2 py-1.5 font-medium text-brand"
      : "block rounded px-2 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors select-none hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
      >
        <AdjustmentsHorizontalIcon className="size-4" />
        Filters & Sort
      </button>

      {open &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 bg-black/50 ${
              closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in"
            }`}
            onClick={close}
          >
            <div
              className={`ml-auto flex h-full w-full max-w-xs flex-col gap-5 overflow-y-auto bg-background p-5 ${
                closing ? "animate-drawer-out" : "animate-drawer-in"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Filters & Sort</span>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="flex size-8 items-center justify-center text-neutral-500 dark:text-neutral-400"
                >
                  <XMarkIcon className="size-6" />
                </button>
              </div>

              {hasAnyFilter && (
                <Link
                  href={basePath}
                  onClick={() => setOpen(false)}
                  className="-mt-3 w-fit text-sm font-medium text-brand hover:underline"
                >
                  Clear All
                </Link>
              )}

              <FilterSection title={`Sort by (${currentSortLabel})`}>
                {sortOptions.map((opt) => (
                  <Link
                    key={opt.value}
                    href={hrefWith({ sort: opt.value, page: 1 })}
                    onClick={() => setOpen(false)}
                    className={sortLinkClass(filters.sort === opt.value)}
                  >
                    {opt.label}
                  </Link>
                ))}
              </FilterSection>

              <FilterSection title="Category">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={hrefWith({ category: toggleFilterValue(filters.category, c.slug), page: 1 })}
                    onClick={() => setOpen(false)}
                    className={checkboxRowClass}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={!!filters.category?.includes(c.slug)}
                      className={checkboxClass}
                    />
                    <span className="flex-1">{c.name}</span>
                    <span className={countBadgeClass}>{categoryCounts[c.slug] ?? 0}</span>
                  </Link>
                ))}
              </FilterSection>

              <FilterSection title="Brand">
                {brands.map((b) => (
                  <Link
                    key={b}
                    href={hrefWith({ brand: toggleFilterValue(filters.brand, b), page: 1 })}
                    onClick={() => setOpen(false)}
                    className={checkboxRowClass}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={!!filters.brand?.includes(b)}
                      className={checkboxClass}
                    />
                    <span className="flex-1">{b}</span>
                    <span className={countBadgeClass}>{brandCounts[b]}</span>
                  </Link>
                ))}
              </FilterSection>

              <FilterSection title="Price">
                <form method="get" action={basePath} className="flex items-center gap-2">
                  {filters.q && <input type="hidden" name="q" value={filters.q} />}
                  {filters.category?.map((c) => (
                    <input key={c} type="hidden" name="category" value={c} />
                  ))}
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
                  onClick={() => setOpen(false)}
                  className={checkboxRowClass}
                >
                  <input type="checkbox" readOnly checked={!!filters.inStock} className={checkboxClass} />
                  In stock only
                </Link>
                <Link
                  href={hrefWith({ onSale: filters.onSale ? undefined : "1", page: 1 })}
                  onClick={() => setOpen(false)}
                  className={checkboxRowClass}
                >
                  <input type="checkbox" readOnly checked={!!filters.onSale} className={checkboxClass} />
                  On sale
                </Link>
              </FilterSection>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
