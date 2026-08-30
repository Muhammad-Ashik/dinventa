"use client";

import Link from "next/link";
import {
  Cog6ToothIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/20/solid";
import { logout } from "@/lib/actions/auth";
import { Dropdown } from "@/components/dropdown";

const itemClass =
  "flex items-center gap-2 px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800";

// Mobile counterpart to AccountMenu (desktop) — same account actions, but
// triggered by the plain avatar icon in the collapsed mobile header row
// (no name/chevron, no room for those) instead of sending the tap straight
// to /account.
export function MobileAccountMenu({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const firstName = name.split(" ")[0];

  return (
    <Dropdown
      align="right"
      panelClassName="mt-6 w-52 rounded-lg border border-neutral-200 bg-background py-1.5 text-sm shadow-lg dark:border-neutral-700 dark:shadow-black/40"
      trigger={({ toggle }) => (
        <button type="button" onClick={toggle} aria-label="Account">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {firstName.charAt(0).toUpperCase()}
          </span>
        </button>
      )}
    >
      <p className="px-4 py-1.5 text-neutral-500 dark:text-neutral-400">
        Welcome back, {firstName}
      </p>
      {isAdmin && (
        <Link href="/admin" className={itemClass}>
          <Cog6ToothIcon className="size-4" />
          Admin dashboard
        </Link>
      )}
      <Link href="/account" className={itemClass}>
        <Squares2X2Icon className="size-4" />
        My Account
      </Link>
      <Link href="/orders" className={itemClass}>
        <ClipboardDocumentListIcon className="size-4" />
        Your orders
      </Link>
      <Link href="/account/settings" className={itemClass}>
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
