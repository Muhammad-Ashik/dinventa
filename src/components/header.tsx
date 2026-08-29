import Link from "next/link";
import { ShoppingCartIcon, HeartIcon, MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/dal";
import { getCategories } from "@/lib/products";
import { getWishlistCount } from "@/lib/wishlist";
import { CartCountBadge } from "@/components/cart-count-badge";
import { AccountMenu } from "@/components/account-menu";
import { NavCategoriesDropdown } from "@/components/nav-categories-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";

const badgeClass =
  "absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white";

export async function Header() {
  const [user, categories] = await Promise.all([getCurrentUser(), getCategories()]);
  const wishlistCount = await getWishlistCount(user?.id);

  return (
    <header className="sticky top-0 z-40 bg-surface shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-4">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Din<span className="text-brand">venta</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-9 md:flex">
          <Link
            href="/popular"
            className="text-base font-medium text-dark transition-colors hover:text-brand dark:text-neutral-100"
          >
            Popular
          </Link>
          <Link
            href="/products"
            className="text-base font-medium text-dark transition-colors hover:text-brand dark:text-neutral-100"
          >
            All Products
          </Link>
          <NavCategoriesDropdown categories={categories} />
          <Link
            href="/products?onSale=1"
            className="text-base font-medium text-dark transition-colors hover:text-brand dark:text-neutral-100"
          >
            Deals
          </Link>
          <Link
            href="/orders"
            className="text-base font-medium text-dark transition-colors hover:text-brand dark:text-neutral-100"
          >
            Track Order
          </Link>
        </nav>

        <nav className="ml-auto hidden shrink-0 items-center gap-5 md:flex">
          <Link
            href="/products"
            aria-label="Search products"
            className="text-neutral-700 transition-colors hover:text-brand dark:text-neutral-300"
          >
            <MagnifyingGlassIcon className="size-5.5" />
          </Link>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative text-neutral-700 transition-colors hover:text-brand dark:text-neutral-300"
          >
            <HeartIcon className="size-5.5" />
            {wishlistCount > 0 && <span className={badgeClass}>{wishlistCount}</span>}
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-neutral-700 transition-colors hover:text-brand dark:text-neutral-300"
          >
            <ShoppingCartIcon className="size-5.5" />
            <CartCountBadge className={badgeClass} />
          </Link>

          <ThemeToggle />

          {user ? (
            <AccountMenu name={user.name} isAdmin={user.role === "ADMIN"} />
          ) : (
            <Link
              href="/login"
              aria-label="Sign in"
              className="text-neutral-700 transition-colors hover:text-brand dark:text-neutral-300"
            >
              <UserIcon className="size-5.5" />
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4 md:hidden">
          {user ? (
            <Link href="/account" aria-label="Account">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Sign in"
              className="text-neutral-700 transition-colors hover:text-brand dark:text-neutral-300"
            >
              <UserIcon className="size-6" />
            </Link>
          )}

          <ThemeToggle />

          <MobileMenu
            user={user ? { name: user.name, role: user.role } : null}
            categories={categories}
            wishlistCount={wishlistCount}
          />
        </div>
      </div>
    </header>
  );
}
