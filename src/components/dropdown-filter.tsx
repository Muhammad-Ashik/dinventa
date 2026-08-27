"use client";

import { useEffect, useRef } from "react";

// Native <details>/<summary> for the toggle mechanics (no JS needed for
// open/close itself), plus a thin client-side layer just to close it on an
// outside click or Escape — without that, the panel stays open and can trap
// clicks on whatever's underneath it until the user clicks the trigger again.
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
      <summary
        className={`flex cursor-pointer list-none items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors select-none [&::-webkit-details-marker]:hidden ${
          active
            ? "border-brand bg-brand-light text-brand"
            : "border-neutral-300 text-neutral-700 hover:border-neutral-400 group-open:border-brand group-open:text-brand"
        }`}
      >
        {label}
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
      <div
        className={`absolute left-0 z-30 mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-4 text-sm shadow-lg ${panelClassName ?? ""}`}
      >
        {children}
      </div>
    </details>
  );
}
