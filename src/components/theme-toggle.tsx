"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

// Manual light/dark toggle. Persists to localStorage under "theme" and
// flips the `.dark` class on <html> that every `dark:` utility in the app
// keys off (see the `@custom-variant dark` declaration in globals.css).
// The initial state is read from the DOM rather than localStorage directly
// so it matches whatever the blocking inline script in layout.tsx already
// decided (localStorage, falling back to OS preference) — avoiding a brief
// icon flip right after mount.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage may be unavailable (private mode, disabled storage) —
      // the toggle still works for the current page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="cursor-pointer text-neutral-600 hover:text-brand dark:text-neutral-300 dark:hover:text-brand"
    >
      {isDark ? (
        <SunIcon className="h-6 w-6" />
      ) : (
        <MoonIcon className="h-6 w-6" />
      )}
    </button>
  );
}
