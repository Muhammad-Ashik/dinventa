import "server-only";
import { Type } from "@google/genai";
import { generateWithFallback } from "@/lib/gemini";
import { generateStructured } from "@/lib/llm";
import { extractJsonObject, realProductSearchPrompt, type RawProductCandidate } from "./types";

// Gemini can't combine Google Search grounding with a JSON responseSchema in
// one call (confirmed via Google's own docs/dev forum), so this is a
// two-step call: (1) a free-text, search-grounded research pass, then (2) a
// normal structured extraction pass over that research text. Both steps
// need a Gemini project with billing enabled — the free tier gets no Search
// grounding allocation at all.
export async function findRealProductsViaGemini(
  count: number,
  category: { name: string; slug: string },
  retailers: { name: string; domain: string }[],
  existingNames: string[]
): Promise<RawProductCandidate[]> {
  const prompt = realProductSearchPrompt(count, category, retailers, existingNames);

  const researchResponse = await generateWithFallback(prompt, {
    tools: [{ googleSearch: {} }],
  });
  const researchText = researchResponse.text;
  if (!researchText) throw new Error("Empty search-grounded response from Gemini");

  const extractionPrompt = [
    "Extract the product list from this research into the exact JSON shape requested. Research:",
    researchText,
  ].join("\n\n");

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      products: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            price: { type: Type.NUMBER },
            brand: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            sourceUrl: { type: Type.STRING },
            isSubstitute: { type: Type.BOOLEAN },
          },
          required: ["name", "description", "price", "brand", "imageUrl", "sourceUrl", "isSubstitute"],
        },
      },
    },
    required: ["products"],
  };
  const jsonShapeDescription = `{ "products": [ { "name": string, "description": string, "price": number, "brand": string, "imageUrl": string, "sourceUrl": string, "isSubstitute": boolean } ] }`;

  const text = await generateStructured(extractionPrompt, responseSchema, jsonShapeDescription);
  const parsed = JSON.parse(extractJsonObject(text)) as { products: RawProductCandidate[] };
  return parsed.products ?? [];
}
