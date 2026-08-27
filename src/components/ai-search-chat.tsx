"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex w-80 flex-col gap-3 rounded-lg border bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="font-medium">Find a product</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-neutral-500"
            >
              ✕
            </button>
          </div>

          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto text-sm">
            {messages.length === 0 && (
              <p className="text-neutral-500">
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
                      ? "rounded bg-red-50 px-3 py-1.5 text-red-700"
                      : "rounded bg-neutral-100 px-3 py-1.5"
                }
              >
                {m.text}
              </p>
            ))}
            {pending && <p className="text-neutral-400">Thinking...</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are you looking for?"
              disabled={pending}
              className="flex-1 rounded border px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark disabled:opacity-50"
            >
              Go
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-brand px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-brand-dark"
      >
        {open ? "Close" : "Ask AI"}
      </button>
    </div>
  );
}
