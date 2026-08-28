"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export function NavCategoriesDropdown({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
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

  return (
    <details ref={ref} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 font-medium text-dark transition-colors select-none hover:text-brand [&::-webkit-details-marker]:hidden">
        Categories
        <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 z-30 mt-3 w-56 rounded-lg border border-neutral-200 bg-white py-1.5 text-sm shadow-lg">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="block px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </details>
  );
}
