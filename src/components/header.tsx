import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { getCategories } from "@/lib/products";
import { logout } from "@/lib/actions/auth";
import { CartCountBadge } from "@/components/cart-count-badge";

export async function Header() {
  const [user, categories] = await Promise.all([getCurrentUser(), getCategories()]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          Din<span className="text-brand">venta</span>
        </Link>

        <form action="/products" method="get" className="hidden flex-1 sm:flex">
          <input
            name="q"
            placeholder="Search for products..."
            className="w-full rounded-l border border-r-0 border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="submit"
            aria-label="Search"
            className="rounded-r bg-brand px-4 text-white hover:bg-brand-dark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>

        <nav className="ml-auto flex shrink-0 items-center gap-4 text-sm">
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-brand">
              Admin
            </Link>
          )}

          {user ? (
            <form action={logout}>
              <button type="submit" className="cursor-pointer hover:text-brand">
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand">
                Log in
              </Link>
              <Link href="/register" className="hidden hover:text-brand sm:inline">
                Sign up
              </Link>
            </>
          )}

          <Link href="/cart" className="flex items-center gap-1.5 font-medium hover:text-brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3 3 0 0 0 2.905 2.228h6.75a3 3 0 0 0 2.903-2.228l1.311-4.917a.75.75 0 0 0-.724-.943H6.108l-.634-2.377a1.873 1.873 0 0 0-1.81-1.383H2.25ZM7.5 20.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM17.25 21.375a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" />
            </svg>
            Cart
            <CartCountBadge />
          </Link>
        </nav>
      </div>

      <div className="border-t bg-neutral-50">
        <nav className="mx-auto flex w-full max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 text-sm">
          <Link href="/products" className="shrink-0 font-medium text-brand">
            All Products
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="shrink-0 text-neutral-700 hover:text-brand"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
