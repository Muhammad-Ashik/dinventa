import "server-only";
import { generateWithFallback } from "@/lib/gemini";
import { generateJsonViaOpenRouter } from "@/lib/openrouter";

// Provider-agnostic structured-JSON call: tries Gemini (primary model, then
// its pinned fallback — see generateWithFallback) first, and if both fail
// (e.g. Gemini's daily free-tier quota is exhausted), falls through to
// OpenRouter's free tier as a genuinely separate quota pool.
export async function generateStructured(
  contents: string,
  responseSchema: object,
  jsonShapeDescription: string
): Promise<string> {
  try {
    const response = await generateWithFallback(contents, {
      responseMimeType: "application/json",
      responseSchema,
    });
    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  } catch (error) {
    console.warn("Gemini (primary + fallback) failed, falling back to OpenRouter:", error);
    return generateJsonViaOpenRouter(contents, jsonShapeDescription);
  }
}
