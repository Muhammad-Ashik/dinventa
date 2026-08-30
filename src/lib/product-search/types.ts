// Deliberately no "server-only" here — BANNED_DOMAINS is imported into
// src/lib/definitions.ts, which client form components also import for their
// state types, so this file must stay safe to pull into a client bundle.

// A domain can never be added as a vetted retailer through the settings UI,
// no matter what an admin types in — Daraz's ToS explicitly bans "any use of
// data mining, robots, or similar data gathering and extraction tools", and
// Pickaboo blocks even a robots.txt request outright. This is a hard safety
// net on top of (not a replacement for) manually vetting every retailer
// before adding it.
export const BANNED_DOMAINS = ["daraz.com.bd", "pickaboo.com"];

// A candidate as returned directly by a provider search (or the brainstorm
// fallback) — price is whatever that source considers the price (a real
// scraped cost when sourceUrl is set, a plausible retail guess otherwise).
export type RawProductCandidate = {
  name: string;
  description: string;
  price: number;
  brand: string;
  imageUrl: string;
  sourceUrl: string | null;
  isSubstitute: boolean;
};

// The final shape used to create a PendingProduct row — price already has
// markup applied (when realPrice is set) or is left as-is (brainstorm
// fallback, no real cost to mark up).
export type SourcedProductCandidate = {
  name: string;
  description: string;
  brand: string;
  imageUrl: string;
  price: number;
  realPrice: number | null;
  sourceUrl: string | null;
  sourceDomain: string | null;
  isSubstitute: boolean;
};

export function realProductSearchPrompt(
  count: number,
  category: { name: string; slug: string },
  retailers: { name: string; domain: string }[],
  existingNames: string[]
): string {
  const siteFilters = retailers.map((r) => `site:${r.domain}`).join(" OR ");
  return [
    `You are sourcing real, currently-sold products for Dinventa, an ecommerce store in Bangladesh (prices in BDT/taka), for the "${category.name}" category.`,
    `Use web search restricted to these retailers only: ${retailers
      .map((r) => `${r.name} (${r.domain})`)
      .join("; ")}.`,
    `Search queries should be scoped like: ${siteFilters} <product type>.`,
    `Find ${count} real products currently listed on those sites, matching the "${category.name}" category.`,
    "For each one, use the EXACT product name as shown on the retailer's page, the EXACT current price in BDT, and the direct product image URL (the og:image meta tag value, or the main large product photo — not a thumbnail).",
    "If the same or an equivalent product appears on more than one of these retailers, report only the cheaper listing.",
    'If you cannot find the exact product you were looking for, you may substitute a comparable real, currently-listed product from these retailers — if you do, set "isSubstitute": true for that item; otherwise set it to false.',
    existingNames.length > 0
      ? `Do not repeat products that duplicate or closely overlap with these existing ones: ${existingNames.join(", ")}.`
      : "",
    "Respond with ONLY valid JSON (no markdown code fences, no commentary before or after), matching exactly this shape:",
    `{ "products": [ { "name": string, "description": string (1-2 sentences, written by you, not copied from the retailer), "price": number, "brand": string, "imageUrl": string, "sourceUrl": string, "isSubstitute": boolean } ] }`,
  ]
    .filter(Boolean)
    .join("\n");
}

// Strips a leading/trailing markdown code fence if the model added one
// despite being told not to, then extracts the first top-level {...} block
// — a light safety net since none of the search providers' web-search tools
// guarantee strict JSON-schema-only output the way a plain (non-tool-using)
// structured call can.
export function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return candidate.trim();
  return candidate.slice(start, end + 1);
}
