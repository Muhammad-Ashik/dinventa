import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular";

export type ProductFilters = {
  q?: string;
  // Real multi-select — checking "Electronics" and "Fashion" shows products
  // in either, matching what a checkbox actually implies (unlike the old
  // single-slug version, which silently only kept the last one picked).
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: ProductSort;
};

const SORT_TO_ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  // Real popularity — ranked by actual completed order-line count, same
  // metric the homepage "Best Selling Products" section uses. Never a
  // fabricated popularity score.
  popular: { orderItems: { _count: "desc" } },
};

export function parseProductFilters(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilters {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const all = (v: string | string[] | undefined) =>
    v === undefined ? [] : Array.isArray(v) ? v : [v];

  const minPrice = first(searchParams.minPrice);
  const maxPrice = first(searchParams.maxPrice);
  const sort = first(searchParams.sort);
  const category = all(searchParams.category);
  const brand = all(searchParams.brand);

  return {
    q: first(searchParams.q) || undefined,
    category: category.length > 0 ? category : undefined,
    brand: brand.length > 0 ? brand : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock: first(searchParams.inStock) === "1" || undefined,
    onSale: first(searchParams.onSale) === "1" || undefined,
    sort: sort && sort in SORT_TO_ORDER_BY ? (sort as ProductSort) : undefined,
  };
}

function buildProductWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  return {
    status: "ACTIVE",
    ...(filters.category?.length ? { category: { slug: { in: filters.category } } } : {}),
    ...(filters.brand?.length ? { brand: { in: filters.brand } } : {}),
    ...(filters.inStock ? { stock: { gt: 0 } } : {}),
    ...(filters.onSale ? { compareAtPrice: { not: null } } : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function getProducts(filters: ProductFilters) {
  return prisma.product.findMany({
    where: buildProductWhere(filters),
    orderBy: SORT_TO_ORDER_BY[filters.sort ?? "newest"],
    include: { category: true },
  });
}

// Page-based variant for listing pages with real pagination (e.g. /popular)
// — returns the total match count alongside the page's items so the UI can
// show an honest "Showing X of Y" and render only as many page links as
// actually exist.
export async function getProductsPaged(filters: ProductFilters, page: number, pageSize: number) {
  const where = buildProductWhere(filters);
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_TO_ORDER_BY[filters.sort ?? "newest"],
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// Distinct brands among active products, for the filter sidebar — not a
// separate model, just the live set of values actually in use so the filter
// never lists a brand with zero matching products.
export async function getBrands(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}

// Real per-category product counts for the filter sidebar (e.g. "Fashion
// (6)") — never a static/estimated number.
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const rows = await prisma.product.groupBy({
    by: ["categoryId"],
    where: { status: "ACTIVE" },
    _count: true,
  });
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const idToSlug = new Map(categories.map((c) => [c.id, c.slug]));
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const slug = idToSlug.get(row.categoryId);
    if (slug) counts[slug] = row._count;
  }
  return counts;
}

export async function getBrandCounts(): Promise<Record<string, number>> {
  const rows = await prisma.product.groupBy({
    by: ["brand"],
    where: { status: "ACTIVE" },
    _count: true,
  });
  return Object.fromEntries(rows.map((r) => [r.brand, r._count]));
}
