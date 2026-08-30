"use client";

import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Dropdown } from "@/components/dropdown";
import { categoryIcon } from "@/lib/category-icons";

export function NavCategoriesDropdown({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
  return (
    <Dropdown
      align="center"
      panelClassName="mt-6 w-56 rounded-lg border border-neutral-200 bg-background py-1.5 text-sm shadow-lg dark:border-neutral-700 dark:shadow-black/40"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1 font-medium text-dark transition-colors select-none hover:text-brand dark:text-neutral-100"
        >
          Categories
          <ChevronDownIcon className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    >
      {categories.map((c) => {
        const CategoryIcon = categoryIcon(c.slug);
        return (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="flex items-center gap-2 px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <CategoryIcon className="size-4" /> {c.name}
          </Link>
        );
      })}
    </Dropdown>
  );
}
