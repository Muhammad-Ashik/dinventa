import "server-only";

type ReVerifyResult = { realPrice: number; imageUrl: string | null };

// Tries JSON-LD Product schema first (Othoba and similar platforms embed
// this — the more reliable structured source), then Open Graph / Product
// meta tags (Star Tech and similar). Same two techniques already validated
// manually while researching Phase 5's seed data.
function extractJsonLdProduct(html: string): { price?: number; image?: string } | null {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const node = Array.isArray(item["@graph"])
          ? item["@graph"].find((n: { "@type"?: string }) => n["@type"] === "Product")
          : item;
        if (node && (node["@type"] === "Product" || node.offers)) {
          const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          const price = offer?.price;
          const image = Array.isArray(node.image) ? node.image[0] : node.image;
          return { price: price !== undefined ? Number(price) : undefined, image };
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

function extractOgTags(html: string): { price?: number; image?: string } {
  const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const priceMatch =
    html.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i);
  return {
    image: imageMatch?.[1],
    price: priceMatch ? Number(priceMatch[1]) : undefined,
  };
}

// Best-effort re-check against a previously-found source page (idea 22) —
// returns null when the page is unreachable/gone or neither technique finds
// a usable price, which the caller treats as "possibly delisted" rather
// than throwing.
export async function reVerifyProductSource(sourceUrl: string): Promise<ReVerifyResult | null> {
  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DinventaBot/1.0)" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;

  const html = await res.text();
  const jsonLd = extractJsonLdProduct(html);
  const og = extractOgTags(html);

  const price = jsonLd?.price ?? og.price;
  const image = jsonLd?.image ?? og.image ?? null;
  if (!price || !Number.isFinite(price) || price <= 0) return null;

  return { realPrice: Math.round(price), imageUrl: image };
}
