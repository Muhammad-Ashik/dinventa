// Deliberately no "server-only" guard: this has no secrets (Openverse's
// search API is keyless), and it needs to be importable from prisma/seed.ts
// too, which runs via plain `tsx` outside Next's bundler.

// Openverse (openverse.org, Wikimedia-backed) indexes openly-licensed images
// from Flickr, museums, etc. Anonymous requests are throttled to ~1/sec,
// which is fine for our sequential seeding/candidate-generation use.

// Catalog-style product names ("A5 Notebook Pack (3-Pack)") routinely return
// zero results — Openverse's index is naturalistic photo titles/tags, not
// product listings. Confirmed by testing: stripping parentheticals and
// digit/model codes, then trying progressively shorter tails of the name
// (full phrase → last 2 words → last word) reliably finds *something*,
// since e-commerce names put the core noun last ("... Mechanical Keyboard").
function buildSearchCandidates(name: string): string[] {
  const cleaned = name
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);

  const candidates = [cleaned, words.slice(-2).join(" "), words.slice(-1).join(" ")];
  return [...new Set(candidates.filter(Boolean))];
}

async function searchOpenverse(query: string): Promise<string | null> {
  const res = await fetch(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=1&license_type=commercial,modification`,
    { signal: AbortSignal.timeout(8_000) }
  );
  if (!res.ok) throw new Error(`Openverse request failed: ${res.status}`);

  const data = await res.json();
  const thumbnail = data.results?.[0]?.thumbnail;
  return typeof thumbnail === "string" && thumbnail ? thumbnail : null;
}

export async function findProductImageUrl(name: string, seedFallback: string): Promise<string> {
  const fallback = `https://picsum.photos/seed/${seedFallback}/600/600`;

  try {
    for (const query of buildSearchCandidates(name)) {
      const thumbnail = await searchOpenverse(query);
      if (thumbnail) return thumbnail;
    }
    return fallback;
  } catch (error) {
    console.warn(`findProductImageUrl: Openverse lookup failed for "${name}":`, error);
    return fallback;
  }
}
