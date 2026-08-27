"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export function AccountMenu({
  name,
  isAdmin,
}: {
  name: string;
  isAdmin: boolean;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) {
        ref.current.open = false;
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const firstName = name.split(" ")[0];

  return (
    <details ref={ref} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium transition-colors select-none hover:text-brand [&::-webkit-details-marker]:hidden">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{firstName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-4 transition-transform group-open:rotate-180"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1.5 text-sm shadow-lg">
        {isAdmin && (
          <Link
            href="/admin"
            className="block px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand"
          >
            Admin dashboard
          </Link>
        )}
        <Link
          href="/orders"
          className="block px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand"
        >
          Your orders
        </Link>
        <Link
          href="/account"
          className="block px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand"
        >
          Profile settings
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="block w-full px-4 py-2 text-left text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand"
          >
            Log out
          </button>
        </form>
      </div>
    </details>
  );
}
