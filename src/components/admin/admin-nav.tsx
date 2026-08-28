"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products/new", label: "Add product" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-neutral-200 text-sm">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border-b-2 px-3 py-2.5 font-medium transition-colors ${
              active
                ? "border-brand text-brand"
                : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
