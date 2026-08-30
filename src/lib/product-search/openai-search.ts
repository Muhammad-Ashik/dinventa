import "server-only";
import { extractJsonObject, realProductSearchPrompt, type RawProductCandidate } from "./types";

const OPENAI_MODEL = "gpt-5.1";
const TIMEOUT_MS = 30_000;

// Raw fetch, no SDK — matches the project's existing precedent for
// secondary/tertiary AI providers (see src/lib/openrouter.ts) rather than
// adding a new dependency. Uses the Responses API's built-in `web_search`
// tool, which (per OpenAI's docs) can be combined with a normal text
// response in one call, unlike Gemini's grounding/JSON-mode split.
//
// NOT yet live-tested against a real account — exact response shape here is
// best-effort from documentation. Expect to correct `text` extraction below
// once this runs against a real OPENAI_API_KEY (see Phase 5a in the project
// plan).
export async function findRealProductsViaOpenAI(
  count: number,
  category: { name: string; slug: string },
  retailers: { name: string; domain: string }[],
  existingNames: string[]
): Promise<RawProductCandidate[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is not set");

  const prompt = realProductSearchPrompt(count, category, retailers, existingNames);

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: OPENAI_MODEL,
      tools: [{ type: "web_search" }],
      input: prompt,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  // Responses API: `output_text` is a convenience field some SDKs synthesize
  // client-side, not guaranteed present in the raw HTTP response — fall
  // back to scanning `output[].content[]` for the first message-type text
  // block if it's missing.
  type OutputContent = { type?: string; text?: string };
  type OutputItem = { type?: string; content?: OutputContent[] };
  const text: string | undefined =
    data.output_text ??
    (data.output as OutputItem[] | undefined)
      ?.flatMap((item) => item.content ?? [])
      .find((c) => typeof c.text === "string")?.text;

  if (!text) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(extractJsonObject(text)) as { products: RawProductCandidate[] };
  return parsed.products ?? [];
}
