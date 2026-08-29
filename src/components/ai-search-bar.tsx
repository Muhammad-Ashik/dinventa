"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { useAiSearch } from "@/lib/use-ai-search";

// Slim "Ask AI" entry point for listing-style pages — full-width by default
// so it fits comfortably next to a "Filters" heading in a narrow sidebar
// column, not a fixed-width bar meant for a page header row.
export function AiSearchBar() {
  const { input, setInput, pending, error, submit } = useAiSearch();

  return (
    <div className="flex w-full flex-col gap-2 border-b border-neutral-200 pb-5 dark:border-neutral-800">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <SparklesIcon className="size-4 text-brand" /> Ask AI
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input.trim());
        }}
        className="flex w-full flex-col gap-2"
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
          rows={2}
          disabled={pending}
          className="w-full resize-none rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Thinking…" : "Ask AI"}
        </button>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
