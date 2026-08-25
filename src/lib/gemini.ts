import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentConfig } from "@google/genai";

const globalForGemini = globalThis as unknown as {
  gemini: GoogleGenAI | undefined;
};

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

export const gemini = globalForGemini.gemini ?? new GoogleGenAI({ apiKey });

if (process.env.NODE_ENV !== "production") {
  globalForGemini.gemini = gemini;
}

// Alias that always points at Google's current Flash model, so this never
// needs updating as specific model versions get deprecated.
export const GEMINI_MODEL = "gemini-flash-latest";

// Brand-new "latest" models are sometimes overloaded right after release; this
// pinned model is a fallback when the primary keeps failing. Was
// "gemini-2.5-flash" — Google has since made that a 404 ("no longer available
// to new users") on at least one of our API keys, so pinned one generation
// back from "latest" instead (still fully supported, presumably less
// contested than the very newest release). Revisit if this too gets sunset.
export const GEMINI_FALLBACK_MODEL = "gemini-3.6-flash";

// The SDK already retries internally (5 attempts by default, backing off up
// to 60s) before an error ever reaches app code — far too patient for a
// request/response flow. Cap it per-model instead: a couple of quick, bounded
// attempts against the primary ("latest") model, and if a brand-new model is
// overloaded, fail over to a previously-stable pinned model rather than keep
// waiting on the same congested one.
const PER_ATTEMPT_HTTP_OPTIONS = {
  timeout: 10_000, // Google enforces a 10s floor; a shorter value is a 400.
  retryOptions: { attempts: 2, initialDelay: 0.5, maxDelay: 2 },
};

export async function generateWithFallback(
  contents: string,
  config: Omit<GenerateContentConfig, "httpOptions">
) {
  try {
    return await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { ...config, httpOptions: PER_ATTEMPT_HTTP_OPTIONS },
    });
  } catch (primaryError) {
    console.warn(
      `Primary model ${GEMINI_MODEL} failed, falling back to ${GEMINI_FALLBACK_MODEL}:`,
      primaryError
    );
    return gemini.models.generateContent({
      model: GEMINI_FALLBACK_MODEL,
      contents,
      config: { ...config, httpOptions: PER_ATTEMPT_HTTP_OPTIONS },
    });
  }
}
