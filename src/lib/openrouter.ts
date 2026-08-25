import "server-only";

// Last-resort fallback when both Gemini attempts fail (e.g. daily quota
// exhausted). Free, no-expiry tier at openrouter.ai — picked an Nvidia-hosted
// model specifically: some of OpenRouter's ":free" models (e.g. the Gemma
// ones) are themselves proxied through Google AI Studio's free tier, which
// wouldn't actually be independent of the Gemini quota this is meant to
// fall back from. Confirmed via testing this one isn't (provider: "Nvidia").
const OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const TIMEOUT_MS = 15_000;

export async function generateJsonViaOpenRouter(
  prompt: string,
  jsonShapeDescription: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Dinventa",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: `Respond with ONLY valid JSON (no markdown fences, no commentary) matching this shape:\n${jsonShapeDescription}`,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  return text;
}
