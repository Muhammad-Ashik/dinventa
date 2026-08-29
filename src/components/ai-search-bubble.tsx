"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAiSearch } from "@/lib/use-ai-search";

// Mobile-only stand-in for the homepage's AiSearchHero panel and the
// listing pages' AiSearchBar — both are full inline panels that eat a
// screen's worth of height before a phone even reaches real content, so on
// mobile they're hidden entirely (see page.tsx / product-listing-page.tsx)
// in favor of this single floating bubble, present on every page, that
// opens the same "Ask AI" form in a modal on tap. Sits at the very bottom
// of the corner, with ScrollToTopButton (bottom-32 on mobile) stacked
// above it — they'd otherwise occupy the exact same spot once a shopper
// scrolls past 400px.
export function AiSearchBubble() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const { input, setInput, pending, error, submit } = useAiSearch();

  function close() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 150);
  }

  return (
    <>
      <div className="fixed right-5 bottom-5 z-40 flex flex-col items-center gap-1.5 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask AI"
          className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-colors hover:bg-brand-dark"
        >
          <ChatBubbleLeftRightIcon className="size-6" />
        </button>
        <span className="rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white">Ask AI</span>
      </div>

      {open &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 ${
              closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in"
            }`}
            onClick={close}
          >
            <div
              className={`w-full max-w-md rounded-2xl bg-surface p-5 shadow-xl ${
                closing ? "animate-modal-panel-out" : "animate-modal-panel-in"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-base font-bold">
                  <SparklesIcon className="size-4.5 text-brand" /> Ask AI
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="flex size-8 items-center justify-center text-neutral-500 dark:text-neutral-400"
                >
                  <XMarkIcon className="size-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input.trim());
                }}
                className="mt-3 flex w-full flex-col gap-2.5"
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
                  autoFocus
                  disabled={pending}
                  className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SparklesIcon className="size-4" />
                  {pending ? "Thinking…" : "Ask AI"}
                </button>
              </form>

              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
