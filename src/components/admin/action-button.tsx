"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckIcon } from "@heroicons/react/20/solid";

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
  danger:
    "border border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-950/40 dark:active:bg-red-950/60",
  neutral:
    "border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
};

const SUCCESS_DISPLAY_MS = 5000;

// Must be rendered inside the <form> it belongs to — useFormStatus reads the
// nearest parent form's pending state. Shows three states: idle, pending
// ("Working..."), and a 5s success label after a submit completes, during
// which the button stays disabled so a second click can't double-fire the
// action before the page has re-rendered with the new state.
export function ActionButton({
  children,
  successLabel,
  variant = "neutral",
}: {
  children: React.ReactNode;
  successLabel: string;
  variant?: "primary" | "danger" | "neutral";
}) {
  const { pending } = useFormStatus();
  const [showSuccess, setShowSuccess] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
      return;
    }
    if (!wasPending.current) return;
    wasPending.current = false;
    setShowSuccess(true);
    const timer = setTimeout(() => setShowSuccess(false), SUCCESS_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  const disabled = pending || showSuccess;

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
        showSuccess
          ? "border border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400"
          : VARIANT_CLASSES[variant]
      }`}
    >
      {pending ? (
        "Working…"
      ) : showSuccess ? (
        <>
          <CheckIcon className="size-4" /> {successLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
