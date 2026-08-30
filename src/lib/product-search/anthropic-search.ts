import "server-only";
import { extractJsonObject, realProductSearchPrompt, type RawProductCandidate } from "./types";

const ANTHROPIC_MODEL = "claude-sonnet-5";
const ANTHROPIC_VERSION = "2023-06-01";
const TIMEOUT_MS = 30_000;

// Raw fetch, no SDK — matches src/lib/openrouter.ts's precedent. Anthropic's
// Messages API `web_search_20250305` tool has no native JSON-schema
// enforcement alongside tool use, so the prompt asks for JSON directly and
// extractJsonObject() is the only safety net (same approach as the Gemini
// two-step extraction).
//
// NOT yet live-tested against a real account — exact response shape here is
// best-effort from documentation (see Phase 5a in the project plan).
export async function findRealProductsViaAnthropic(
  count: number,
  category: { name: string; slug: string },
  retailers: { name: string; domain: string }[],
  existingNames: string[]
): Promise<RawProductCandidate[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");

  const prompt = realProductSearchPrompt(count, category, retailers, existingNames);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  // The content array can interleave text blocks with server_tool_use /
  // web_search_tool_result blocks when the tool fires — concatenate every
  // text block rather than assuming there's exactly one.
  type ContentBlock = { type?: string; text?: string };
  const text: string = ((data.content as ContentBlock[]) ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("\n");

  if (!text) throw new Error("Empty response from Anthropic");

  const parsed = JSON.parse(extractJsonObject(text)) as { products: RawProductCandidate[] };
  return parsed.products ?? [];
}
