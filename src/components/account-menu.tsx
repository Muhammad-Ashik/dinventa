"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/20/solid";
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
  const itemClass =
    "flex items-center gap-2 px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800";

  return (
    <details ref={ref} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-foreground transition-colors select-none hover:text-brand [&::-webkit-details-marker]:hidden">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{firstName}</span>
        <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1.5 text-sm shadow-lg dark:border-neutral-700 dark:bg-surface dark:shadow-black/40">
        {isAdmin && (
          <Link href="/admin" className={itemClass}>
            <Cog6ToothIcon className="size-4" />
            Admin dashboard
          </Link>
        )}
        <Link href="/orders" className={itemClass}>
          <ClipboardDocumentListIcon className="size-4" />
          Your orders
        </Link>
        <Link href="/account" className={itemClass}>
          <UserCircleIcon className="size-4" />
          Profile settings
        </Link>
        <form action={logout}>
          <button type="submit" className={`w-full text-left ${itemClass}`}>
            <ArrowRightStartOnRectangleIcon className="size-4" />
            Log out
          </button>
        </form>
      </div>
    </details>
  );
}
