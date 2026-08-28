import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { ProductCard } from "@/components/product-card";

export default async function WishlistPage() {
  const session = await verifySession();

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = items
    .map((i) => i.product)
    .filter((p) => p.status === "ACTIVE");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Your wishlist</h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-neutral-500">
          <HeartIcon className="size-10 text-neutral-300" />
          <p>
            Nothing saved yet.{" "}
            <Link href="/products" className="font-medium text-brand hover:underline">
              Browse products
            </Link>{" "}
            and tap the heart icon to save items here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isWishlisted isLoggedIn />
          ))}
        </div>
      )}
    </div>
  );
}
