import { prisma } from "@/lib/prisma";

// A review only counts as "verified" once the order carrying that product
// actually shipped — DELIVERED never gets set anywhere in this app today, so
// gating on it would make reviews permanently unreachable.
const VERIFIED_PURCHASE_STATUSES = ["SHIPPED", "DELIVERED"] as const;

export async function canReviewProduct(userId: string, productId: string): Promise<boolean> {
  const [purchased, existing] = await Promise.all([
    prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: { in: [...VERIFIED_PURCHASE_STATUSES] } },
      },
      select: { id: true },
    }),
    prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    }),
  ]);
  return !!purchased && !existing;
}

export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductRatingSummary(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });
  return { average: result._avg.rating ?? 0, count: result._count };
}

// Homepage-wide feed of real reviews that actually have written feedback —
// star-only ratings with no comment don't give a stranger anything to read.
export async function getFeaturedReviews(limit: number) {
  return prisma.review.findMany({
    where: { comment: { not: null } },
    include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

// Products from this user's shipped/delivered orders that don't have a
// review from them yet — the "Need to Review" list on /account/reviews.
export async function getProductsNeedingReview(userId: string) {
  const items = await prisma.orderItem.findMany({
    where: {
      order: { userId, status: { in: [...VERIFIED_PURCHASE_STATUSES] } },
      product: { reviews: { none: { userId } } },
    },
    include: { product: true },
    distinct: ["productId"],
    orderBy: { id: "desc" },
  });
  return items.map((item) => item.product);
}

// This user's own past reviews — the "Reviewed Products" list on
// /account/reviews.
export async function getUserReviews(userId: string) {
  return prisma.review.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}
