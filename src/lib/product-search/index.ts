import "server-only";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { getMarkupSetting, applyMarkup } from "@/lib/settings";
import { getVettedRetailersForCategory } from "./retailers";
import { findRealProductsViaOpenAI } from "./openai-search";
import { findRealProductsViaGemini } from "./gemini-search";
import { findRealProductsViaAnthropic } from "./anthropic-search";
import { findProductsViaBrainstorm } from "./brainstorm";
import type { RawProductCandidate, SourcedProductCandidate } from "./types";

// A price this far outside plausible retail range is almost certainly a
// scraping/extraction error (wrong element, currency mismatch, etc.), not a
// real listing (idea 8) — a simple flat ceiling, not category-aware.
const MAX_PRICE_BDT = 1_000_000;

type ProviderFn = (
  count: number,
  category: { name: string; slug: string },
  retailers: { name: string; domain: string }[],
  existingNames: string[]
) => Promise<RawProductCandidate[]>;

// Priority order: OpenAI's web_search tool reportedly supports structured
// output in the same call (most reliable JSON); Gemini needs a two-step
// dance plus a billing-enabled project; Anthropic has no schema enforcement
// alongside tool use at all. Easy to reorder once Phase 5a's live testing
// shows how each actually behaves.
const PROVIDERS: { envVar: string; fn: ProviderFn }[] = [
  { envVar: "OPENAI_API_KEY", fn: findRealProductsViaOpenAI },
  { envVar: "GEMINI_API_KEY", fn: findRealProductsViaGemini },
  { envVar: "ANTHROPIC_API_KEY", fn: findRealProductsViaAnthropic },
];

async function isImageUrlHealthy(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DinventaBot/1.0)" },
      signal: AbortSignal.timeout(6_000),
    });
    if (res.ok) return (res.headers.get("content-type") ?? "").startsWith("image/");

    // Some CDNs (seen on vetted retailer product pages) reject HEAD outright
    // — fall back to a small ranged GET before giving up on this image.
    const rangedRes = await fetch(url, {
      headers: {
        Range: "bytes=0-1024",
        "User-Agent": "Mozilla/5.0 (compatible; DinventaBot/1.0)",
      },
      signal: AbortSignal.timeout(6_000),
    });
    return rangedRes.ok && (rangedRes.headers.get("content-type") ?? "").startsWith("image/");
  } catch {
    return false;
  }
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export type FindRealProductsResult = {
  candidates: SourcedProductCandidate[];
  // True whenever the result came from the plain AI-brainstorm fallback
  // (no real listing behind it) rather than an actual web search — the
  // caller surfaces this to the admin so a silent quality drop is never
  // mistaken for a real find.
  usedFallback: boolean;
  fallbackReason?: string;
};

// Provider-agnostic entry point for the "Find real products" admin feature.
// Tries each configured real-search provider in priority order, falling
// through to the next on a thrown error; falls back to the old brainstorm
// behavior if none are configured (or every real candidate gets filtered
// out below) so the button keeps working with zero paid keys — but always
// reports when that happened, rather than letting fake data pass silently
// as if it were a real find.
export async function findRealProducts(
  categoryId: string,
  count: number,
  existingNames: string[]
): Promise<FindRealProductsResult> {
  const category = await prisma.category.findUniqueOrThrow({ where: { id: categoryId } });
  const retailers = await getVettedRetailersForCategory(categoryId);

  if (retailers.length === 0) {
    return {
      candidates: await findProductsViaBrainstorm(count, category, existingNames),
      usedFallback: true,
      fallbackReason: `No vetted retailers are configured for "${category.name}" — add one from Settings to enable real search for this category.`,
    };
  }

  const configuredProviders = PROVIDERS.filter((p) => !!process.env[p.envVar]);
  if (configuredProviders.length === 0) {
    return {
      candidates: await findProductsViaBrainstorm(count, category, existingNames),
      usedFallback: true,
      fallbackReason:
        "No real-search provider is configured (need OPENAI_API_KEY, ANTHROPIC_API_KEY, or a billing-enabled GEMINI_API_KEY — the Gemini free tier can't do web search).",
    };
  }

  let raw: RawProductCandidate[] | null = null;
  let lastError: unknown;
  let geminiAttemptedAndFailed = false;
  for (const provider of configuredProviders) {
    try {
      raw = await provider.fn(count, category, retailers, existingNames);
      break;
    } catch (error) {
      lastError = error;
      if (provider.envVar === "GEMINI_API_KEY") geminiAttemptedAndFailed = true;
      console.warn(`findRealProducts: ${provider.envVar} attempt failed:`, error);
    }
  }

  if (!raw) {
    return {
      candidates: await findProductsViaBrainstorm(count, category, existingNames, geminiAttemptedAndFailed),
      usedFallback: true,
      fallbackReason: `Every configured search provider failed (${lastError instanceof Error ? lastError.message : "see server logs"}).`,
    };
  }

  const markup = await getMarkupSetting();
  const seenSlugs = new Set<string>();
  const priced: SourcedProductCandidate[] = [];

  for (const candidate of raw) {
    if (!candidate.sourceUrl || !candidate.imageUrl) continue;
    if (!Number.isFinite(candidate.price) || candidate.price <= 0 || candidate.price > MAX_PRICE_BDT) {
      continue;
    }

    // Cross-site dedup safety net (idea 6) beyond the prompt-level
    // "report only the cheaper listing" instruction.
    const dedupeKey = slugify(candidate.name);
    if (!dedupeKey || seenSlugs.has(dedupeKey)) continue;

    if (!(await isImageUrlHealthy(candidate.imageUrl))) continue;

    seenSlugs.add(dedupeKey);
    const realPrice = Math.round(candidate.price);
    priced.push({
      name: candidate.name,
      description: candidate.description,
      brand: candidate.brand?.trim() || "Generic",
      imageUrl: candidate.imageUrl,
      realPrice,
      price: applyMarkup(realPrice, markup),
      sourceUrl: candidate.sourceUrl,
      sourceDomain: hostnameOf(candidate.sourceUrl),
      isSubstitute: candidate.isSubstitute,
    });
  }

  if (priced.length > 0) return { candidates: priced, usedFallback: false };

  return {
    candidates: await findProductsViaBrainstorm(count, category, existingNames),
    usedFallback: true,
    fallbackReason: `The search provider returned ${raw.length} candidate(s) for "${category.name}", but all were filtered out (bad price/image/duplicate).`,
  };
}
