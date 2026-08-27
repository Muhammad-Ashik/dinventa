import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { getCategories } from "@/lib/products";
import { CartCountBadge } from "@/components/cart-count-badge";
import { AccountMenu } from "@/components/account-menu";

export async function Header() {
  const [user, categories] = await Promise.all([getCurrentUser(), getCategories()]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-5 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          Din<span className="text-brand">venta</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-4 overflow-x-auto text-sm md:flex">
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

        <nav className="ml-auto flex shrink-0 items-center gap-4 text-sm">
          {user ? (
            <AccountMenu name={user.name} isAdmin={user.role === "ADMIN"} />
          ) : (
            <>
              <Link href="/login" className="transition-colors hover:text-brand">
                Log in
              </Link>
              <Link href="/register" className="hidden transition-colors hover:text-brand sm:inline">
                Sign up
              </Link>
            </>
          )}

          <Link
            href="/cart"
            className="flex items-center gap-1.5 font-medium transition-colors hover:text-brand"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3 3 0 0 0 2.905 2.228h6.75a3 3 0 0 0 2.903-2.228l1.311-4.917a.75.75 0 0 0-.724-.943H6.108l-.634-2.377a1.873 1.873 0 0 0-1.81-1.383H2.25ZM7.5 20.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM17.25 21.375a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            <CartCountBadge />
          </Link>
        </nav>
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
