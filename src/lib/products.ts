import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductSort = "newest" | "price_asc" | "price_desc";

export type ProductFilters = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
};

const SORT_TO_ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
};

export function parseProductFilters(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilters {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const minPrice = first(searchParams.minPrice);
  const maxPrice = first(searchParams.maxPrice);
  const sort = first(searchParams.sort);

  return {
    q: first(searchParams.q) || undefined,
    category: first(searchParams.category) || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort: sort && sort in SORT_TO_ORDER_BY ? (sort as ProductSort) : undefined,
  };
}

export async function getProducts(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(filters.category ? { category: { slug: filters.category } } : {}),
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

  return prisma.product.findMany({
    where,
    orderBy: SORT_TO_ORDER_BY[filters.sort ?? "newest"],
    include: { category: true },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
