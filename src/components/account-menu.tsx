"use client";

import Link from "next/link";
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/20/solid";
import { logout } from "@/lib/actions/auth";
import { Dropdown } from "@/components/dropdown";

export function AccountMenu({
  name,
  isAdmin,
}: {
  name: string;
  isAdmin: boolean;
}) {
  const firstName = name.split(" ")[0];
  const itemClass =
    "flex items-center gap-2 px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800";

  return (
    <Dropdown
      align="right"
      panelClassName="mt-2 w-48 rounded-lg border border-neutral-200 bg-background py-1.5 text-sm shadow-lg dark:border-neutral-700 dark:shadow-black/40"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors select-none hover:text-brand"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {firstName.charAt(0).toUpperCase()}
          </span>
          <span className="hidden sm:inline">{firstName}</span>
          <ChevronDownIcon className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    >
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
    </Dropdown>
  );
}
