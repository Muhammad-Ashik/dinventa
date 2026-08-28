import Link from "next/link";
import { ShoppingCartIcon, HeartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/dal";
import { getCategories } from "@/lib/products";
import { getWishlistCount } from "@/lib/wishlist";
import { CartCountBadge } from "@/components/cart-count-badge";
import { AccountMenu } from "@/components/account-menu";
import { NavCategoriesDropdown } from "@/components/nav-categories-dropdown";

const badgeClass =
  "absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white";

export async function Header() {
  const [user, categories] = await Promise.all([getCurrentUser(), getCategories()]);
  const wishlistCount = await getWishlistCount(user?.id);

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="bg-dark py-3">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 text-xs text-white sm:text-sm">
          <p className="hidden font-medium sm:block">Cash on delivery, anywhere in Bangladesh</p>
          {user ? (
            <p className="font-medium">Welcome back, {user.name.split(" ")[0]}</p>
          ) : (
            <div className="ml-auto flex items-center gap-2 sm:ml-0">
              <Link
                href="/register"
                className="rounded-full border border-white/40 px-3 py-1 font-medium transition-colors hover:border-white hover:bg-white/10"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-white px-3 py-1 font-medium text-dark transition-colors hover:bg-brand-light"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-5 px-4 py-3">
          <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
            Din<span className="text-brand">venta</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <Link href="/products" className="font-medium text-dark transition-colors hover:text-brand">
              All Products
            </Link>
            <NavCategoriesDropdown categories={categories} />
            <Link
              href="/products?onSale=1"
              className="font-medium text-dark transition-colors hover:text-brand"
            >
              Deals
            </Link>
            <Link href="/orders" className="font-medium text-dark transition-colors hover:text-brand">
              Track Order
            </Link>
          </nav>

          <nav className="ml-auto flex shrink-0 items-center gap-4">
            <Link
              href="/products"
              aria-label="Search products"
              className="text-neutral-700 transition-colors hover:text-brand"
            >
              <MagnifyingGlassIcon className="size-5" />
            </Link>

            <Link href="/wishlist" aria-label="Wishlist" className="relative text-neutral-700 transition-colors hover:text-brand">
              <HeartIcon className="size-5" />
              {wishlistCount > 0 && <span className={badgeClass}>{wishlistCount}</span>}
            </Link>

            <Link href="/cart" aria-label="Cart" className="relative text-neutral-700 transition-colors hover:text-brand">
              <ShoppingCartIcon className="size-5" />
              <CartCountBadge className={badgeClass} />
            </Link>

            {user && <AccountMenu name={user.name} isAdmin={user.role === "ADMIN"} />}
          </nav>
        </div>
      </div>

      {/* Category menu collapses to its own scrollable row below the logo/account
          row on small screens, where there's no space for it inline. */}
      <nav className="flex items-center gap-4 overflow-x-auto border-t border-neutral-100 px-4 py-2 text-sm md:hidden">
        <Link href="/products" className="shrink-0 font-medium transition-colors hover:text-brand">
          All Products
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="shrink-0 text-neutral-700 transition-colors hover:text-brand"
          >
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
