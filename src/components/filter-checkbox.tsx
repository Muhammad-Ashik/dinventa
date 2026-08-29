import { CheckIcon } from "@heroicons/react/20/solid";

// Custom checkbox visual for filter rows (category/brand/availability),
// used on both the desktop sidebar (product-listing-page.tsx, a Server
// Component) and the mobile drawer (mobile-filters-drawer.tsx, a Client
// Component) — no "use client" needed since it's just static markup, no
// hooks. The real <input> stays in the DOM (readOnly, reflecting the
// actual filter state) but visually hidden via sr-only; the styled <span>
// after it uses the peer-checked variant to render as a filled brand-blue
// box with a checkmark, instead of the browser's native checkbox square.
export function FilterCheckbox({ checked }: { checked: boolean }) {
  return (
    // input, the decorative box, and the checkmark are three siblings (not
    // the checkmark nested inside the box) — Tailwind's peer-checked variant
    // only matches elements that are themselves a sibling of the peer via
    // CSS's `~` combinator, not a descendant of one. Nesting the checkmark
    // inside the box meant its own peer-checked:opacity-100 never matched
    // anything (confirmed via computed style: opacity stayed 0 even with
    // checked=true), even though the box's own peer-checked:bg-brand — on a
    // genuine sibling — worked fine.
    <span className="relative mt-0.5 flex size-4 shrink-0">
      <input type="checkbox" readOnly checked={checked} className="peer sr-only" />
      <span className="absolute inset-0 rounded border border-neutral-300 transition-colors peer-checked:border-brand peer-checked:bg-brand dark:border-neutral-600" />
      <CheckIcon className="relative m-auto size-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
    </span>
  );
}
