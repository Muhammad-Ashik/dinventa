import Link from "next/link";
import { getCategories } from "@/lib/products";
import { getCurrentUser } from "@/lib/dal";

export async function Footer() {
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()]);

  return (
    <footer className="border-t bg-neutral-50">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-10 text-sm sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
          <span className="text-lg font-bold">
            Din<span className="text-brand">venta</span>
          </span>
          <p className="text-neutral-600">
            AI-assisted shopping for Bangladesh — smart search, phone-confirmed orders, and
            doorstep delivery.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Shop</h3>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="text-neutral-600 transition-colors hover:text-brand"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Account</h3>
          <Link href="/products" className="text-neutral-600 transition-colors hover:text-brand">
            All products
          </Link>
          <Link href="/cart" className="text-neutral-600 transition-colors hover:text-brand">
            Your cart
          </Link>
          {user ? (
            <Link href="/orders" className="text-neutral-600 transition-colors hover:text-brand">
              Your orders
            </Link>
          ) : (
            <Link href="/login" className="text-neutral-600 transition-colors hover:text-brand">
              Log in
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Ordering</h3>
          <p className="text-neutral-600">Cash on Delivery, nationwide.</p>
          <p className="text-neutral-600">We call to confirm every order before it ships.</p>
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Dinventa.
      </div>
    </footer>
  );
}
