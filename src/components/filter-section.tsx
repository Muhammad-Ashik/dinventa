"use client";

import { useState } from "react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

// Real JS-driven accordion, not native <details> — <details> can't animate
// closing at all (its content goes from "there" to "gone" in one frame, with
// no hook to defer removal), which is exactly why this always snapped shut
// instantly no matter what CSS targeted it. The grid-template-rows 0fr/1fr
// trick lets height itself transition smoothly without ever measuring pixel
// heights in JS.
export function FilterSection({
  title,
  icon,
  children,
}: {
  title: string;
  // A rendered element, not a component reference — this is used from a
  // Server Component (product-listing-page.tsx) passing into this Client
  // Component, and only plain serializable values/JSX elements can cross
  // that boundary, not component-type function references.
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-neutral-200 pb-5 dark:border-neutral-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between font-semibold"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronUpIcon
          className={`size-5 text-neutral-400 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
