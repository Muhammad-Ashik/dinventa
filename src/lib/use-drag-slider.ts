"use client";

import { useRef, useState } from "react";

// Threshold to actually change slides on release — small drags snap back.
const CHANGE_THRESHOLD = 40;
// Any movement past this counts as "a drag happened", which suppresses the
// click that would otherwise fire on release (e.g. navigating a product
// card's image Link mid-swipe).
const CLICK_SUPPRESS_THRESHOLD = 8;

// Shared mouse/touch "grab and drag" gesture for image sliders (hero
// carousel, product card gallery, quick-view gallery) — one pointer-events
// implementation instead of three slightly-different ones.
export function useDragSlider(count: number, index: number, onIndexChange: (i: number) => void) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const maxMovement = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    if (count <= 1) return;
    startX.current = e.clientX;
    maxMovement.current = 0;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    const delta = e.clientX - startX.current;
    maxMovement.current = Math.max(maxMovement.current, Math.abs(delta));
    setDragOffset(delta);
  }

  function endDrag() {
    if (!isDragging) return;
    if (dragOffset <= -CHANGE_THRESHOLD) onIndexChange((index + 1) % count);
    else if (dragOffset >= CHANGE_THRESHOLD) onIndexChange((index - 1 + count) % count);
    setIsDragging(false);
    setDragOffset(0);
  }

  function onClickCapture(e: React.MouseEvent) {
    if (maxMovement.current > CLICK_SUPPRESS_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return {
    dragOffset,
    isDragging,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
    },
  };
}
