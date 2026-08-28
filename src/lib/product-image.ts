// Deliberately no "server-only" guard: this needs to be importable from
// prisma/seed.ts too, which runs via plain `tsx` outside Next's bundler.

// Catalog-style product names ("A5 Notebook Pack (3-Pack)") rarely match a
// stock-photo index as a full phrase, so the last-two-words tail ("Notebook
// Pack") goes first — e-commerce names put the core noun phrase last
// ("... Mechanical Keyboard"), and this is short enough to usually hit a
// relevant photo without being so short it turns generic.
//
// The single LAST WORD alone is deliberately never tried: many product
// names end in a collective noun that's meaningless on its own and actively
// misleads an image search — "Set" (→ table settings), "Pack" (→ wolf
// packs), "Pair", "Bottle" (→ any bottle at all) all confirmed to return
// wrong results in testing. Two words of context avoids that.
function buildSearchCandidates(name: string): string[] {
  const cleaned = name
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter((w) => w.length >= 3);

  const candidates = [words.slice(-2).join(" "), cleaned];
  return [...new Set(candidates.filter(Boolean))];
}

// Pexels: curated, consistently-lit photography — the primary source
// whenever a key is configured. Free tier, https://www.pexels.com/api/.
async function searchPexels(query: string, apiKey: string, count: number): Promise<string[]> {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=square`,
    { headers: { Authorization: apiKey }, signal: AbortSignal.timeout(8_000) }
  );
  if (!res.ok) throw new Error(`Pexels request failed: ${res.status}`);

  const data = await res.json();
  const photos = Array.isArray(data.photos) ? data.photos : [];
  return photos.map((p: { src?: { medium?: string } }) => p.src?.medium).filter((u: unknown): u is string => typeof u === "string" && !!u);
}

// Openverse (openverse.org, Wikimedia-backed): keyless fallback when no
// Pexels key is set, or Pexels comes up empty. Anonymous requests are
// throttled to ~1/sec, fine for our sequential seeding/candidate use.
async function searchOpenverse(query: string, count: number): Promise<string[]> {
  const res = await fetch(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${count}&license_type=commercial,modification`,
    { signal: AbortSignal.timeout(8_000) }
  );
  if (!res.ok) throw new Error(`Openverse request failed: ${res.status}`);

  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map((r: { thumbnail?: string }) => r.thumbnail).filter((u: unknown): u is string => typeof u === "string" && !!u);
}

// Returns up to `count` real photos for the gallery (never padded with
// repeats or placeholders) — the first candidate query that returns
// anything wins; a query returning fewer than `count` just yields a
// shorter-than-requested gallery rather than mixing in a second, less
// relevant query's results.
export async function findProductImages(
  name: string,
  seedFallback: string,
  count: number
): Promise<string[]> {
  const pexelsKey = process.env.PEXELS_API_KEY;
  const candidates = buildSearchCandidates(name);

  if (pexelsKey) {
    try {
      for (const query of candidates) {
        const urls = await searchPexels(query, pexelsKey, count);
        if (urls.length > 0) return urls;
      }
    } catch (error) {
      console.warn(`findProductImages: Pexels lookup failed for "${name}":`, error);
    }
  }

  try {
    for (const query of candidates) {
      const urls = await searchOpenverse(query, count);
      if (urls.length > 0) return urls;
    }
  } catch (error) {
    console.warn(`findProductImages: Openverse lookup failed for "${name}":`, error);
  }

  return [`https://picsum.photos/seed/${seedFallback}/600/600`];
}

export async function findProductImageUrl(name: string, seedFallback: string): Promise<string> {
  const images = await findProductImages(name, seedFallback, 1);
  return images[0];
}
