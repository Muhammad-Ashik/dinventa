"use client";

import { useRef, useState } from "react";

// Threshold to actually change slides on release — small drags snap back.
const CHANGE_THRESHOLD = 40;
// Any movement past this counts as "a drag happened", which suppresses the
// click that would otherwise fire on release (e.g. navigating a product
// card's image Link mid-swipe).
const CLICK_SUPPRESS_THRESHOLD = 8;

// Shared mouse/touch "grab and drag" gesture for image sliders (hero
// carousel, product card gallery, quick-view gallery), plus the "infinite
// loop" illusion: stepping past the last slide (or before the first)
// animates onto a clone of the opposite end rendered one slot past that
// edge, then snaps to the real slide with the transition switched off for
// one frame. Without this, wrapping from the first slide back to the last
// animated straight across every slide in between (a naive
// `index=0 -> index=count-1` transform jump reveals the whole strip sliding
// past) instead of feeling like an adjacent, instant loop. Callers must
// render `wrapSlides(items)` instead of `items` directly, and use
// `position`/`skipTransition` in place of `index`/`isDragging` for the
// strip's transform and transition classes.
export function useDragSlider(
  count: number,
  index: number,
  onIndexChange: (i: number) => void,
  wrapDurationMs = 300
) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [wrap, setWrap] = useState<"start" | "end" | null>(null);
  const [suppressTransition, setSuppressTransition] = useState(false);
  const startX = useRef(0);
  const maxMovement = useRef(0);

  function settleWrap(landingIndex: number) {
    setTimeout(() => {
      setSuppressTransition(true);
      onIndexChange(landingIndex);
      setWrap(null);
      // Wait a paint frame for the transition-less jump to actually land
      // before re-enabling transitions, or the jump itself would animate.
      requestAnimationFrame(() => requestAnimationFrame(() => setSuppressTransition(false)));
    }, wrapDurationMs);
  }

  function step(delta: 1 | -1) {
    if (count <= 1 || wrap) return;
    const target = index + delta;
    if (target >= count) {
      setWrap("end");
      settleWrap(0);
    } else if (target < 0) {
      setWrap("start");
      settleWrap(count - 1);
    } else {
      onIndexChange(target);
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (count <= 1 || wrap) return;
    startX.current = e.clientX;
    maxMovement.current = 0;
    setIsDragging(true);
    // Capture on currentTarget (the stable element these handlers are
    // attached to), not target (whatever was actually clicked — often a
    // Next/Image-managed <img> a couple of levels down). Capturing on that
    // inner node was observed to silently fire "lostpointercapture" one
    // event into the drag, killing the gesture before it could register a
    // real move.
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    const delta = e.clientX - startX.current;
    maxMovement.current = Math.max(maxMovement.current, Math.abs(delta));
    setDragOffset(delta);
  }

  function endDrag() {
    if (!isDragging) return;
    if (dragOffset <= -CHANGE_THRESHOLD) step(1);
    else if (dragOffset >= CHANGE_THRESHOLD) step(-1);
    setIsDragging(false);
    setDragOffset(0);
  }

  function onClickCapture(e: React.MouseEvent) {
    if (maxMovement.current > CLICK_SUPPRESS_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // Position to render the strip at: index normally, or one slot past
  // whichever edge is being wrapped across, where wrapSlides' clone lives.
  const position = wrap === "end" ? count : wrap === "start" ? -1 : index;

  return {
    dragOffset,
    isDragging,
    skipTransition: isDragging || suppressTransition,
    position,
    next: () => step(1),
    prev: () => step(-1),
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
    },
  };
}

// [last, ...items, first] so the strip always has a clone one slot past
// each edge for useDragSlider's wrap animation to land on. Pair with
// `position` (not the raw index) for the transform: `-(position + 1) * 100%`.
// Always wraps, even for a single item (duplicating it into 3 identical
// slots) — `position` is always the real index plus this one-slot offset,
// so skipping the wrap here for count <= 1 would leave the transform
// pointing at a clone slot that was never rendered, pushing the only real
// slide fully out of view.
export function wrapSlides<T>(items: T[]): T[] {
  if (items.length === 0) return items;
  return [items[items.length - 1], ...items, items[0]];
}
