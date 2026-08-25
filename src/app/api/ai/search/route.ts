import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { generateStructured } from "@/lib/llm";
import { getCategories } from "@/lib/products";
import { AiSearchRequestSchema } from "@/lib/definitions";

const NO_CATEGORY = "any";
const SORT_VALUES = ["newest", "price_asc", "price_desc"] as const;

type SearchIntent = {
  category: string;
  keywords: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: (typeof SORT_VALUES)[number];
  summary: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validated = AiSearchRequestSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const categories = await getCategories();
  const categorySlugs = categories.map((c) => c.slug);

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        format: "enum",
        enum: [...categorySlugs, NO_CATEGORY],
        description:
          "The single best-matching product category slug for the request, or " +
          `"${NO_CATEGORY}" if no category clearly applies or multiple could apply.`,
      },
      keywords: {
        type: Type.STRING,
        nullable: true,
        description:
          "Short free-text search terms (product type, brand, features) to match " +
          "against product names/descriptions. Null if the category alone is enough.",
      },
      minPrice: {
        type: Type.NUMBER,
        nullable: true,
        description: "Minimum price in BDT (taka), if the user mentioned a lower bound.",
      },
      maxPrice: {
        type: Type.NUMBER,
        nullable: true,
        description: "Maximum price in BDT (taka), if the user mentioned an upper bound.",
      },
      sort: {
        type: Type.STRING,
        format: "enum",
        enum: [...SORT_VALUES],
        description:
          "How results should be sorted. Use price_asc for \"cheapest\"/\"under X\" " +
          "requests, price_desc for \"best\"/\"premium\" requests, otherwise newest.",
      },
      summary: {
        type: Type.STRING,
        description:
          "One short, friendly sentence confirming what you searched for, to show the " +
          "user before they see results. Mention BDT prices with the ৳ symbol.",
      },
    },
    required: ["category", "sort", "summary"],
  };

  const prompt = [
    "You are a shopping assistant for Dinventa, a Bangladeshi ecommerce store (prices in BDT/taka).",
    "Extract structured search filters from the user's request.",
    `Available category slugs: ${categorySlugs.join(", ")}.`,
    `If nothing clearly fits, use "${NO_CATEGORY}" for category.`,
    `User request: "${validated.data.message}"`,
  ].join("\n");

  const jsonShapeDescription = [
    `{ "category": one of [${[...categorySlugs, NO_CATEGORY].join(", ")}],`,
    `"keywords": string or null, "minPrice": number or null, "maxPrice": number or null,`,
    `"sort": one of [${SORT_VALUES.join(", ")}], "summary": string }`,
  ].join(" ");

  let intent: SearchIntent;
  try {
    const text = await generateStructured(prompt, responseSchema, jsonShapeDescription);
    intent = JSON.parse(text) as SearchIntent;
  } catch (error) {
    console.error("AI search failed:", error);
    return NextResponse.json(
      { error: "The AI search assistant is unavailable right now. Please try the filters below instead." },
      { status: 502 }
    );
  }

  const params = new URLSearchParams();
  if (intent.category && intent.category !== NO_CATEGORY) {
    params.set("category", intent.category);
  }
  if (intent.keywords) params.set("q", intent.keywords);
  if (intent.minPrice !== null && intent.minPrice !== undefined) {
    params.set("minPrice", String(intent.minPrice));
  }
  if (intent.maxPrice !== null && intent.maxPrice !== undefined) {
    params.set("maxPrice", String(intent.maxPrice));
  }
  if (intent.sort && intent.sort !== "newest") params.set("sort", intent.sort);

  const query = params.toString();
  return NextResponse.json({
    redirectUrl: query ? `/products?${query}` : "/products",
    summary: intent.summary,
  });
}
