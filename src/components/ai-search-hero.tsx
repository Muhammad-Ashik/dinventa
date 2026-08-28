"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SparklesIcon } from "@heroicons/react/24/solid";

const EXAMPLE_QUERIES = [
  "Gaming mouse under 1500 taka",
  "Gift for my mom",
  "Waterproof bluetooth speaker",
];

export function AiSearchHero() {
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

  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-white px-6 py-8 text-center">
      <h2 className="text-lg font-bold">Tell our AI what you&apos;re looking for</h2>
      <p className="mt-1.5 text-xs text-neutral-600">
        Describe it in your own words and we&apos;ll take you straight to matching products.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input.trim());
        }}
        className="mt-5 flex w-full flex-col gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(input.trim());
            }
          }}
          placeholder="e.g. keyboard under 500 taka"
          rows={3}
          disabled={pending}
          className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SparklesIcon className="size-4" />
          {pending ? "Thinking…" : "Ask AI"}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setInput(q)}
            className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] text-neutral-600 transition-colors hover:border-brand hover:text-brand"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
