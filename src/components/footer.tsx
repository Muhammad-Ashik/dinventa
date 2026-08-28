import Link from "next/link";
import { getCategories } from "@/lib/products";
import { getCurrentUser } from "@/lib/dal";

export async function Footer() {
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()]);

  return (
    <footer className="overflow-hidden border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap justify-between gap-12 px-4 pt-16 pb-12 xl:flex-nowrap xl:gap-20">
        <div className="w-full max-w-[350px]">
          <span className="text-2xl font-bold text-foreground">
            Din<span className="text-brand">venta</span>
          </span>
          <p className="mt-5 text-base text-neutral-600 dark:text-neutral-400">
            AI-assisted shopping for Bangladesh — smart search, phone-confirmed orders, and
            doorstep delivery.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Shop</h2>
          <ul className="flex flex-col gap-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="text-base text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full sm:w-auto">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Account</h2>
          <ul className="flex flex-col gap-3">
            <li>
              <Link href="/products" className="text-base text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400">
                All products
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-base text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400">
                Your cart
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="text-base text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400">
                Wishlist
              </Link>
            </li>
            <li>
              {user ? (
                <Link href="/orders" className="text-base text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400">
                  Your orders
                </Link>
              ) : (
                <Link href="/login" className="text-base text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400">
                  Log in
                </Link>
              )}
            </li>
          </ul>
        </div>

        <div className="w-full sm:w-auto">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Ordering</h2>
          <ul className="flex flex-col gap-3 text-base text-neutral-600 dark:text-neutral-400">
            <li>Cash on Delivery, nationwide.</li>
            <li>We call to confirm every order before it ships.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50 py-5 dark:border-neutral-800 dark:bg-surface-muted">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 text-sm text-neutral-600 dark:text-neutral-400">
          © {new Date().getFullYear()} Dinventa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
