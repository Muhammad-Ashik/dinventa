import { ProductListingPage } from "@/components/product-listing-page";
import type { ProductSort } from "@/lib/products";

const PAGE_SIZE = 9;

// Same as /products, but "Best Selling" (real order-count ranking) leads —
// that's the entire point of this page existing separately.
const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "Best Selling" },
  { value: "newest", label: "Latest Products" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default async function PopularPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ProductListingPage
      basePath="/popular"
      baseLabel="Popular"
      defaultSort="popular"
      pageSize={PAGE_SIZE}
      sortOptions={SORT_OPTIONS}
      searchParams={await searchParams}
    />
  );
}
