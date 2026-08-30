import Link from "next/link";
import {
  Squares2X2Icon,
  ArchiveBoxIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { logout } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { key: "dashboard", href: "/account", label: "Dashboard", shortLabel: "Dashboard", Icon: Squares2X2Icon },
  { key: "orders", href: "/orders", label: "Orders", shortLabel: "Orders", Icon: ArchiveBoxIcon },
  { key: "reviews", href: "/account/reviews", label: "My Review", shortLabel: "Reviews", Icon: StarIcon },
  { key: "addresses", href: "/account/addresses", label: "Addresses", shortLabel: "Addresses", Icon: MapPinIcon },
  { key: "settings", href: "/account/settings", label: "Account Setting", shortLabel: "Settings", Icon: UserIcon },
] as const;

// Shared nav for every account-related page (/account, /account/*, /orders)
// — rendered directly in each page rather than a shared layout, since
// /orders is also a standalone top-level route linked from the header and
// footer and isn't nested under /account in the URL.
//
// Two distinct layouts, not one responsively-tweaked one: the full vertical
// list (avatar block + one nav item per row) reads fine on desktop but ate a
// full screen of height on mobile before any real page content appeared, so
// mobile gets a compact avatar row plus a horizontally-scrolling tab strip
// instead.
export function AccountSidebar({
  name,
  memberSince,
  active,
}: {
  name: string;
  memberSince: Date;
  active: (typeof NAV_ITEMS)[number]["key"];
}) {
  const itemClass = (isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-light text-brand"
        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    }`;
  const tabClass = (isActive: boolean) =>
    `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
      isActive
        ? "bg-brand-light text-brand"
        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
    }`;
  const avatar = (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white sm:size-11 sm:text-base">
      {name.charAt(0).toUpperCase()}
    </span>
  );
  const memberSinceLabel = memberSince.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <>
      {/* Mobile: compact avatar row + horizontally-scrolling tab strip. */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:hidden dark:bg-surface">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {avatar}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Member since {memberSinceLabel}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Logout"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <ArrowRightStartOnRectangleIcon className="size-5" />
            </button>
          </form>
        </div>

        <nav className="flex flex-wrap gap-1.5">
          {NAV_ITEMS.map(({ key, href, shortLabel, Icon }) => (
            <Link key={key} href={href} className={tabClass(active === key)}>
              <Icon className="size-4" />
              {shortLabel}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop: full vertical sidebar. */}
      <aside className="hidden h-fit w-64 shrink-0 flex-col gap-1 rounded-2xl bg-white p-4 sm:flex dark:bg-surface">
        <div className="flex items-center gap-3 border-b border-neutral-200 px-2 pb-4 dark:border-neutral-800">
          {avatar}
          <div className="min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Member since {memberSinceLabel}</p>
          </div>
        </div>

        <nav className="mt-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, href, label, Icon }) => (
            <Link key={key} href={href} className={itemClass(active === key)}>
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
          <form action={logout}>
            <button type="submit" className={`w-full text-left ${itemClass(false)}`}>
              <ArrowRightStartOnRectangleIcon className="size-5" />
              Logout
            </button>
          </form>
        </nav>
      </aside>
    </>
  );
}
