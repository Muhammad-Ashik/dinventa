"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AiSearchHero() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const message = input.trim();
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

  return (
    <div className="rounded-lg border-2 border-brand/20 bg-gradient-to-br from-brand-light to-white px-4 py-3 sm:px-6">
      <form onSubmit={handleSubmit} className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <span className="hidden shrink-0 items-center gap-1.5 font-bold whitespace-nowrap sm:flex">
          <span className="text-lg">✨</span> Ask AI:
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="✨ Ask our AI — e.g. mechanical keyboard under 500 taka"
          disabled={pending}
          className="flex-1 rounded border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand sm:hidden"
        />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="mechanical keyboard under 500 taka"
          disabled={pending}
          className="hidden flex-1 rounded border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand sm:block"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="shrink-0 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Thinking…" : "Ask AI"}
        </button>
      </form>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
