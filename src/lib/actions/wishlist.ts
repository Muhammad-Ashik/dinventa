"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOptionalSession } from "@/lib/dal";

// Toggle rather than separate add/remove actions — the heart button always
// calls this one action regardless of current state, since the button
// itself already knows (via isWishlisted) which direction to go.
export async function toggleWishlist(productId: string) {
  const session = await getOptionalSession();
  if (!session) return; // logged-out click is a no-op; UI links to /login instead

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId: session.userId, productId } });
  }

  // The wishlist count badge lives in the header, rendered on every page —
  // revalidating just the current path wouldn't refresh it.
  revalidatePath("/", "layout");
}

export async function removeFromWishlist(productId: string) {
  const session = await getOptionalSession();
  if (!session) return;

  await prisma.wishlistItem.deleteMany({ where: { userId: session.userId, productId } });
  revalidatePath("/", "layout");
}
