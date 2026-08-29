"use client";

import { usePathname } from "next/navigation";
import { useNavigationDirection } from "@/lib/use-navigation-direction";

// Remounting a keyed wrapper on every route change is enough to replay a
// CSS "enter" animation on each navigation — no animation library needed.
// Keyed on pathname only (not the full URL), so changing filters via query
// params on the same page doesn't retrigger it — only real navigations do.
// Slides from the right for a regular forward navigation (clicking a Link),
// from the left when the browser's own Back/Forward buttons were used —
// see useNavigationDirection for how that's told apart.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const direction = useNavigationDirection();

  return (
    <div
      key={pathname}
      className={direction === "back" ? "animate-page-in-back" : "animate-page-in-forward"}
    >
      {children}
    </div>
  );
}
