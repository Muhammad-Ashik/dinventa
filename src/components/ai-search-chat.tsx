"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/20/solid";

type ChatMessage = {
  role: "user" | "assistant" | "error";
  text: string;
};

export function AiSearchChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || pending) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "error", text: data.error ?? "Something went wrong." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.summary }]);
      setTimeout(() => {
        setOpen(false);
        router.push(data.redirectUrl);
      }, 900);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "error", text: "Couldn't reach the AI search assistant. Please try again." },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex w-80 flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-surface">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 font-medium">
              <SparklesIcon className="size-4 text-brand" /> Find a product
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <XMarkIcon className="size-4" />
            </button>
          </div>

          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto text-sm">
            {messages.length === 0 && (
              <p className="text-neutral-500 dark:text-neutral-400">
                Describe what you&apos;re looking for, e.g. &quot;mechanical keyboard under
                500 taka&quot;.
              </p>
            )}
            {messages.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "user"
                    ? "self-end rounded bg-brand px-3 py-1.5 text-white"
                    : m.role === "error"
                      ? "rounded bg-red-50 px-3 py-1.5 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      : "rounded bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800 dark:text-neutral-100"
                }
              >
                {m.text}
              </p>
            ))}
            {pending && <p className="text-neutral-400 dark:text-neutral-500">Thinking...</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are you looking for?"
              disabled={pending}
              className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send"
              className="flex items-center justify-center rounded bg-brand px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PaperAirplaneIcon className="size-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-brand-dark active:bg-brand-dark"
      >
        {open ? <XMarkIcon className="size-4" /> : <SparklesIcon className="size-4" />}
        {open ? "Close" : "Ask AI"}
      </button>
    </div>
  );
}
