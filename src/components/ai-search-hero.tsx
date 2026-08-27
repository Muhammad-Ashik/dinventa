"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "mechanical keyboard under 500 taka",
  "something for a home workout",
  "gift for someone who loves reading",
];

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
    <div className="rounded-lg border-2 border-brand/20 bg-gradient-to-br from-brand-light to-white p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <span className="text-2xl">✨</span>
        <h2 className="text-xl font-bold sm:text-2xl">Ask our AI to find it for you</h2>
      </div>
      <p className="mt-1 text-sm text-neutral-600 sm:text-base">
        Describe what you need in plain language — we&apos;ll find matching products instantly.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. mechanical keyboard under 500 taka"
          disabled={pending}
          className="flex-1 rounded border border-neutral-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Thinking…" : "Ask AI"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            disabled={pending}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
