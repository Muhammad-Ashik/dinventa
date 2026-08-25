import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { CartCountBadge } from "@/components/cart-count-badge";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          Dinventa
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products">Products</Link>
          <Link href="/cart" className="flex items-center">
            Cart
            <CartCountBadge />
          </Link>

          {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}

          {user ? (
            <form action={logout}>
              <button type="submit" className="cursor-pointer">
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
