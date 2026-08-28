import "server-only";
import { prisma } from "@/lib/prisma";

// Used by any page rendering ProductCard grids, so each card can show the
// right heart state without an N+1 query per card.
export async function getWishlistedProductIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(items.map((i) => i.productId));
}

export async function getWishlistCount(userId: string | undefined): Promise<number> {
  if (!userId) return 0;
  return prisma.wishlistItem.count({ where: { userId } });
}
