"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Module-level (survives across client-side navigations within the same
// page load, resets on a hard reload — that's fine, a fresh load has no
// "previous direction" to speak of anyway).
let globalCounter = 0;

// Distinguishes a regular forward navigation (clicking a Link — pushes a
// new, higher-numbered history entry) from the browser's own Back/Forward
// buttons (popstate, moving to an already-numbered entry) so the page
// transition can slide the correct direction instead of always sliding
// "forward". Works by tagging each history entry with its own incrementing
// index in history.state and comparing indices on popstate.
export function useNavigationDirection(): "forward" | "back" {
  const pathname = usePathname();
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const isPopRef = useRef(false);
  const lastIdxRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    function onPopState() {
      isPopRef.current = true;
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const state = window.history.state as { __navIdx?: number } | null;

    if (!mountedRef.current) {
      mountedRef.current = true;
      const idx = state?.__navIdx ?? 0;
      globalCounter = Math.max(globalCounter, idx);
      lastIdxRef.current = idx;
      window.history.replaceState({ ...state, __navIdx: idx }, "");
      return;
    }

    if (isPopRef.current) {
      isPopRef.current = false;
      const idx = state?.__navIdx ?? lastIdxRef.current;
      setDirection(idx < lastIdxRef.current ? "back" : "forward");
      lastIdxRef.current = idx;
    } else {
      globalCounter += 1;
      window.history.replaceState({ ...state, __navIdx: globalCounter }, "");
      setDirection("forward");
      lastIdxRef.current = globalCounter;
    }
    // Only re-run when the route actually changes — this intentionally
    // ignores `direction`/refs so it doesn't loop on its own state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return direction;
}
