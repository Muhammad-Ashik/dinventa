"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { logout } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartCountBadge } from "@/components/cart-count-badge";

const itemClass =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800";

// Everything that doesn't fit in the collapsed mobile header (nav links,
// categories, account actions, search/wishlist/cart, theme toggle) lives
// here instead — a single hamburger-triggered drawer rather than the old
// partial "categories only" scroll row, so mobile actually has parity with
// desktop instead of a cut-down subset.
export function MobileMenu({
  user,
  categories,
  wishlistCount,
}: {
  user: { name: string; role: string } | null;
  categories: { id: string; name: string; slug: string }[];
  wishlistCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 180);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center text-neutral-700 dark:text-neutral-300"
      >
        <Bars3Icon className="size-6" />
      </button>

      {open &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 bg-black/50 ${
              closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in"
            }`}
            onClick={close}
          >
            <div
              className={`ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-background p-5 ${
                closing ? "animate-drawer-out" : "animate-drawer-in"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold tracking-tight">
                  Din<span className="text-brand">venta</span>
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={close}
                  className="flex size-8 items-center justify-center text-neutral-500 dark:text-neutral-400"
                >
                  <XMarkIcon className="size-6" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-1">
                {user ? (
                  <>
                    <p className="px-3 py-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Welcome back, {user.name.split(" ")[0]}
                    </p>
                    {user.role === "ADMIN" && (
                      <Link href="/admin" className={itemClass} onClick={close}>
                        <Cog6ToothIcon className="size-5" /> Admin dashboard
                      </Link>
                    )}
                    <Link href="/orders" className={itemClass} onClick={close}>
                      <ClipboardDocumentListIcon className="size-5" /> Your orders
                    </Link>
                    <Link href="/account" className={itemClass} onClick={close}>
                      <UserCircleIcon className="size-5" /> Profile settings
                    </Link>
                    <form action={logout}>
                      <button type="submit" className={`w-full text-left ${itemClass}`}>
                        <ArrowRightStartOnRectangleIcon className="size-5" /> Log out
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex gap-2 px-1 pb-2">
                    <Link
                      href="/register"
                      onClick={close}
                      className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand dark:border-neutral-700"
                    >
                      Sign up
                    </Link>
                    <Link
                      href="/login"
                      onClick={close}
                      className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                    >
                      Sign in
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <Link href="/popular" className={itemClass} onClick={close}>
                  Popular
                </Link>
                <Link href="/products" className={itemClass} onClick={close}>
                  All Products
                </Link>
                <Link href="/products?onSale=1" className={itemClass} onClick={close}>
                  Deals
                </Link>
                <Link href="/orders" className={itemClass} onClick={close}>
                  Track Order
                </Link>
              </div>

              {categories.length > 0 && (
                <div className="mt-4 flex flex-col gap-1 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <p className="px-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                    Categories
                  </p>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}`}
                      className={itemClass}
                      onClick={close}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-1 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <Link href="/products" className={itemClass} onClick={close}>
                  <MagnifyingGlassIcon className="size-5" /> Search
                </Link>
                <Link href="/wishlist" className={itemClass} onClick={close}>
                  <HeartIcon className="size-5" /> Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
                </Link>
                <Link href="/cart" className={itemClass} onClick={close}>
                  <ShoppingCartIcon className="size-5" />
                  <span className="flex items-center gap-1.5">
                    Cart
                    <CartCountBadge />
                  </span>
                </Link>
                <div className={`${itemClass} justify-between`}>
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
