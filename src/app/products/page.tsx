import { ProductListingPage } from "@/components/product-listing-page";
import type { ProductSort } from "@/lib/products";

const PAGE_SIZE = 9;

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Latest Products" },
  { value: "popular", label: "Best Selling" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ProductListingPage
      basePath="/products"
      baseLabel="Products"
      defaultSort="newest"
      pageSize={PAGE_SIZE}
      sortOptions={SORT_OPTIONS}
      searchParams={await searchParams}
    />
  );
}
