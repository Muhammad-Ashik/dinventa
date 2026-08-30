"use client";

import { useEffect, useState } from "react";

// Typing is tracked in local `draft` state rather than clamping on every
// keystroke — clamping live would, e.g., snap an in-progress "1" → "16" back
// to 1 the instant the field went empty for a keystroke, and would delete a
// cart line the moment someone typed a literal 0 on the way to typing 10.
// Validation/clamping only happens on blur (or Enter), once the user is done.
export function QuantityInput({
  value,
  min = 1,
  max,
  onChange,
  className = "",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit() {
    const parsed = Number(draft);
    const clamped = Number.isFinite(parsed)
      ? Math.min(max ?? Infinity, Math.max(min, Math.round(parsed)))
      : value;
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  }

  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      aria-label="Quantity"
      className={`border-0 bg-transparent text-center font-medium focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
    />
  );
}
