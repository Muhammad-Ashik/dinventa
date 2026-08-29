"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Shared submit logic for every "Ask AI" entry point (homepage hero panel,
// the compact top-of-page bar on listing pages) — one fetch/redirect path
// instead of copy-pasted per component.
export function useAiSearch() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(message: string) {
    if (!message || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(data.redirectUrl);
    } catch {
      setError("Couldn't reach the AI search assistant. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return { input, setInput, pending, error, submit };
}
