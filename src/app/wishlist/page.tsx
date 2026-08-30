import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { PUBLIC_PRODUCT_SELECT } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default async function WishlistPage() {
  const session = await verifySession();

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    include: { product: { select: PUBLIC_PRODUCT_SELECT } },
    orderBy: { createdAt: "desc" },
  });

  const products = items
    .map((i) => i.product)
    .filter((p) => p.status === "ACTIVE");

  return (
    // Full-bleed grey page canvas, matching /cart — the empty-state card
    // is the only thing that stays white here. Breadcrumbs live inside the
    // band so the -mt-8 cancels the layout's top padding right up to the
    // header.
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
        <h1 className="text-xl font-bold sm:text-2xl">Your Wishlist</h1>

        {products.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center dark:bg-surface">
            <span className="flex size-20 items-center justify-center rounded-full bg-dark text-white">
              <HeartIcon className="size-9" />
            </span>
            <p className="mt-4 text-lg font-medium">Your wishlist is empty!</p>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              Tap the heart icon on any product to save it here.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isWishlisted isLoggedIn />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
