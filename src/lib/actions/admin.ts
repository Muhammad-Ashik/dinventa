"use server";

import { revalidatePath } from "next/cache";
import { Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";
import { generateStructured } from "@/lib/llm";
import { getCategories } from "@/lib/products";
import { slugify } from "@/lib/slugify";
import { findProductImageUrl } from "@/lib/product-image";
import { getCallService } from "@/lib/calls";
import { triggerCourierParcel } from "@/lib/confirm-order";
import { getCourierService } from "@/lib/courier";

const CANDIDATE_COUNT = 6;
const DEFAULT_STOCK = 20;

type TrendingCandidate = {
  name: string;
  description: string;
  category: string;
  price: number;
  brand: string;
};

export type FindTrendingState = { success: true } | { error: string } | undefined;

export async function findTrendingProducts(
  _prevState: FindTrendingState
): Promise<FindTrendingState> {
  await verifyAdmin();

  const categories = await getCategories();
  const categorySlugs = categories.map((c) => c.slug);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const [activeProducts, pendingProducts] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { name: true, slug: true } }),
    prisma.pendingProduct.findMany({ where: { status: "PENDING" }, select: { name: true, slug: true } }),
  ]);
  const existingSlugs = new Set([
    ...activeProducts.map((p) => p.slug),
    ...pendingProducts.map((p) => p.slug),
  ]);
  const existingNames = [...activeProducts, ...pendingProducts].map((p) => p.name);

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
            category: {
              type: Type.STRING,
              format: "enum",
              enum: categorySlugs,
              description: "The best-matching category slug for this product.",
            },
            price: {
              type: Type.NUMBER,
              description: "A plausible retail price in BDT (whole taka).",
            },
            brand: {
              type: Type.STRING,
              description:
                "A plausible brand name for this product — a real, well-known brand if the " +
                'product type clearly has one (e.g. "Logitech" for a gaming mouse), otherwise ' +
                'a made-up, generic-sounding house brand name (not an existing real company).',
            },
          },
          required: ["name", "description", "category", "price", "brand"],
        },
      },
    },
    required: ["products"],
  };

  const prompt = [
    "You are a trend-spotting assistant for Dinventa, an ecommerce store in Bangladesh (prices in BDT/taka).",
    `Propose ${CANDIDATE_COUNT} plausible trending products across our existing categories, based on general knowledge of current consumer, tech, fashion, and lifestyle trends.`,
    `Available category slugs: ${categorySlugs.join(", ")}.`,
    existingNames.length > 0
      ? `Do not suggest products that duplicate or closely overlap with these existing products: ${existingNames.join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const jsonShapeDescription = `{ "products": [ { "name": string, "description": string, "category": one of [${categorySlugs.join(", ")}], "price": number, "brand": string } ] }`;

  let candidates: TrendingCandidate[] = [];
  try {
    const text = await generateStructured(prompt, responseSchema, jsonShapeDescription);
    const parsed = JSON.parse(text) as { products: TrendingCandidate[] };
    candidates = parsed.products ?? [];
  } catch (error) {
    console.error("findTrendingProducts: Gemini call failed:", error);
    return { error: "The AI trend search failed. Please try again shortly." };
  }

  for (const candidate of candidates) {
    const category = categoryBySlug.get(candidate.category);
    if (!category) continue;

    const slug = slugify(candidate.name);
    if (!slug || existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);

    const imageUrl = await findProductImageUrl(candidate.name, slug);

    await prisma.pendingProduct.create({
      data: {
        name: candidate.name,
        slug,
        description: candidate.description,
        price: Math.max(1, Math.round(candidate.price)),
        imageUrl,
        brand: candidate.brand?.trim() || "Generic",
        categoryId: category.id,
      },
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function approveProduct(id: string) {
  await verifyAdmin();

  const pending = await prisma.pendingProduct.findUnique({ where: { id } });
  if (!pending || pending.status !== "PENDING") return;

  await prisma.$transaction([
    prisma.product.create({
      data: {
        name: pending.name,
        slug: pending.slug,
        description: pending.description,
        price: pending.price,
        imageUrl: pending.imageUrl,
        brand: pending.brand,
        stock: DEFAULT_STOCK,
        categoryId: pending.categoryId,
      },
    }),
    prisma.pendingProduct.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function rejectProduct(id: string) {
  await verifyAdmin();

  await prisma.pendingProduct.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  revalidatePath("/admin");
}

// Manual overrides for order confirmation — useful in both mock mode (the
// only way to resolve a pending order without real Twilio) and real mode
// (e.g. the call failed, or the customer confirmed some other way).
export async function manuallyConfirmOrder(id: string) {
  await verifyAdmin();

  const { count } = await prisma.order.updateMany({
    where: { id, status: "PENDING_CONFIRMATION" },
    data: { status: "CONFIRMED", confirmationNote: "Manually confirmed by admin." },
  });

  // Awaited (unlike the live-call path) — this is a webpage click, not a
  // phone call, so there's no dead-air concern, and awaiting means the
  // tracking code is ready to show as soon as the page revalidates.
  if (count > 0) await triggerCourierParcel(id);

  revalidatePath("/admin");
}

export async function manuallyDeclineOrder(id: string) {
  await verifyAdmin();

  await prisma.order.updateMany({
    where: { id, status: "PENDING_CONFIRMATION" },
    data: { status: "DECLINED", confirmationNote: "Manually declined by admin." },
  });

  revalidatePath("/admin");
}

export async function retryConfirmationCall(id: string) {
  await verifyAdmin();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.status !== "PENDING_CONFIRMATION") return;

  const callService = await getCallService();
  await callService.initiateConfirmationCall({ id: order.id, phone: order.phone });

  revalidatePath("/admin");
}

export async function retryCourierOrder(id: string) {
  await verifyAdmin();

  const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
  if (!order || order.status !== "CONFIRMED" || order.courierConsignmentId) return;

  const courierService = await getCourierService();
  await courierService.createParcel({
    id: order.id,
    recipientName: order.user.name,
    phone: order.phone,
    shippingAddress: order.shippingAddress,
    totalAmount: order.totalAmount,
  });

  revalidatePath("/admin");
}
