"use client";

import { useEffect, useRef, useState } from "react";

// Shared open/close mechanics for every popup menu (category filter, sort,
// account menu, nav categories) — replaces native <details>/<summary>.
// Native details has no animatable open/close state (content is either
// there or not, with no way to defer removal for an exit transition), so
// closing always snapped instantly no matter what CSS was applied to the
// panel. This keeps the panel mounted for one more frame after "closing" so
// the exit animation actually gets to play, matching how QuickViewModal
// handles its own close.
export function Dropdown({
  trigger,
  children,
  panelClassName = "",
  align = "left",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode;
  panelClassName?: string;
  align?: "left" | "right" | "center";
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function doClose() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 150);
  }

  function toggle() {
    if (open && !closing) doClose();
    else if (!open) setOpen(true);
  }

  // Selecting an option (a link or button inside the panel — a sort
  // option, a category, "log out", ...) should close the menu same as
  // picking from any other dropdown. Without this, clicking straight
  // through a Link navigated the page but left the panel open over the
  // newly-loaded content indefinitely, until some later, unrelated click
  // happened to land outside it.
  //
  // This closes immediately (skipping the animated `closing` state that
  // toggle()/outside-click use) rather than reusing doClose(): a Link click
  // here also kicks off a real navigation, and the Next.js RSC round-trip
  // that follows sometimes replaces this component's DOM node before the
  // 150ms close transition finishes. The animation then restarts on the
  // fresh node — jumping back to fully opaque for a frame before actually
  // unmounting — which reads as a flash/flicker on close. The page is
  // navigating away regardless, so animating this specific close was never
  // going to be reliably visible anyway.
  function handlePanelClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a, button")) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) doClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") doClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={ref} className="group relative">
      {trigger({ open: open && !closing, toggle })}
      {open && (
        <div
          className={`dropdown-panel absolute z-30 ${
            align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
          } ${closing ? "animate-dropdown-out" : "animate-dropdown-in"} ${panelClassName}`}
          onClick={handlePanelClick}
        >
          {children}
        </div>
      )}
    </div>
  );
}
