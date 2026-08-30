import "server-only";
import { Type } from "@google/genai";
import { generateStructured } from "@/lib/llm";
import { generateJsonViaOpenRouter } from "@/lib/openrouter";
import { findProductImages } from "@/lib/product-image";
import { slugify } from "@/lib/slugify";
import type { SourcedProductCandidate } from "./types";

// Pre-Phase-5 behavior, kept as the fallback when none of the real-search
// providers (OpenAI/Gemini/Anthropic) have a configured key, or when a real
// search's candidates all get filtered out by the sanity/image checks —
// keeps "Find real products" working with zero paid keys, just without real
// sourcing (no sourceUrl/realPrice/markup, a stock photo instead of an
// exact one).
//
// skipGemini: set when the caller already tried Gemini for the real-search
// step in this same request and it failed — retrying it here too (via
// generateStructured's Gemini-first chain) would pay its full multi-attempt
// timeout cost a second time for no benefit. Goes straight to OpenRouter
// instead when true.
export async function findProductsViaBrainstorm(
  count: number,
  category: { name: string; slug: string },
  existingNames: string[],
  skipGemini = false
): Promise<SourcedProductCandidate[]> {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      products: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Product name." },
            description: {
              type: Type.STRING,
              description: "1-2 sentence product description for a store listing.",
            },
            price: { type: Type.NUMBER, description: "A plausible retail price in BDT (whole taka)." },
            brand: {
              type: Type.STRING,
              description:
                "A plausible brand name for this product — a real, well-known brand if the " +
                'product type clearly has one (e.g. "Logitech" for a gaming mouse), otherwise ' +
                'a made-up, generic-sounding house brand name (not an existing real company).',
            },
          },
          required: ["name", "description", "price", "brand"],
        },
      },
    },
    required: ["products"],
  };

  const prompt = [
    "You are a trend-spotting assistant for Dinventa, an ecommerce store in Bangladesh (prices in BDT/taka).",
    `Propose ${count} plausible trending products for the "${category.name}" category, based on general knowledge of current consumer, tech, fashion, and lifestyle trends.`,
    existingNames.length > 0
      ? `Do not suggest products that duplicate or closely overlap with these existing products: ${existingNames.join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const jsonShapeDescription = `{ "products": [ { "name": string, "description": string, "price": number, "brand": string } ] }`;

  const text = skipGemini
    ? await generateJsonViaOpenRouter(prompt, jsonShapeDescription)
    : await generateStructured(prompt, responseSchema, jsonShapeDescription);
  const parsed = JSON.parse(text) as {
    products: { name: string; description: string; price: number; brand: string }[];
  };

  const candidates: SourcedProductCandidate[] = [];
  for (const p of parsed.products ?? []) {
    const images = await findProductImages(p.name, slugify(p.name), 1);
    candidates.push({
      name: p.name,
      description: p.description,
      brand: p.brand?.trim() || "Generic",
      imageUrl: images[0],
      price: Math.max(1, Math.round(p.price)),
      realPrice: null,
      sourceUrl: null,
      sourceDomain: null,
      isSubstitute: false,
    });
  }
  return candidates;
}
