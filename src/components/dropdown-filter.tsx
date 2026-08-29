"use client";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Dropdown } from "@/components/dropdown";

export function DropdownFilter({
  label,
  active,
  children,
  panelClassName,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
  panelClassName?: string;
}) {
  return (
    <Dropdown
      panelClassName={`mt-2 w-64 rounded-lg border border-neutral-200 bg-background p-4 text-sm text-foreground shadow-lg dark:border-neutral-700 dark:shadow-black/40 ${panelClassName ?? ""}`}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors select-none ${
            active
              ? "border-brand bg-brand-light text-brand"
              : open
                ? "border-brand text-brand"
                : "border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
          }`}
        >
          {label}
          <ChevronDownIcon className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    >
      {children}
    </Dropdown>
  );
}
