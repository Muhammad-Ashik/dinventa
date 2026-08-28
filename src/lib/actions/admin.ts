"use server";

import { revalidatePath } from "next/cache";
import { Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";
import { generateStructured } from "@/lib/llm";
import { getCategories } from "@/lib/products";
import { slugify } from "@/lib/slugify";
import { findProductImages } from "@/lib/product-image";
import { getCallService } from "@/lib/calls";
import { triggerCourierParcel } from "@/lib/confirm-order";
import { getCourierService } from "@/lib/courier";
import {
  CheckoutFormSchema,
  type CheckoutFormState,
  ManualProductFormSchema,
  type ManualProductFormState,
} from "@/lib/definitions";

// Order statuses where the shipment is either already gone or the order is
// dead — editing shipping info at that point wouldn't reach anyone.
const SHIPPING_INFO_LOCKED_STATUSES = ["DECLINED", "CANCELLED"];
// Line items are only editable before the customer has confirmed — once
// CONFIRMED, courier dispatch is already in motion off of that item list.
const ITEMS_EDITABLE_STATUS = "PENDING_CONFIRMATION";

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

    const images = await findProductImages(candidate.name, slug, 4);

    await prisma.pendingProduct.create({
      data: {
        name: candidate.name,
        slug,
        description: candidate.description,
        price: Math.max(1, Math.round(candidate.price)),
        imageUrl: images[0],
        images,
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
        images: pending.images,
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

// Shipping address/phone stay editable regardless of item-lock status (a
// typo'd address is worth fixing even after the order's confirmed) — only
// blocked once the order is a dead end (declined/cancelled) since there's no
// shipment left to redirect.
export async function updateOrderShippingInfo(
  orderId: string,
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  await verifyAdmin();

  const validatedFields = CheckoutFormSchema.safeParse({
    shippingAddress: formData.get("shippingAddress"),
    phone: formData.get("phone"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { message: "Order not found." };
  if (SHIPPING_INFO_LOCKED_STATUSES.includes(order.status)) {
    return { message: "This order is declined/cancelled — shipping info can't be changed." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: validatedFields.data,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { message: "Shipping info updated." };
}

// Quantity changes adjust Product.stock by the delta, since checkout already
// decremented stock at order-creation time (see createOrder) — the ceiling
// on a new quantity is whatever's currently in stock PLUS what this line
// item already holds (that portion isn't "available" elsewhere, but it's
// available to reassign to this same line).
export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  formData: FormData
) {
  await verifyAdmin();

  const requested = Number(formData.get("quantity"));
  if (!Number.isFinite(requested) || requested < 1) return;

  const [order, item] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId } }),
    prisma.orderItem.findUnique({ where: { id: itemId }, include: { product: true } }),
  ]);
  if (!order || order.status !== ITEMS_EDITABLE_STATUS) return;
  if (!item || item.orderId !== orderId) return;

  const ceiling = item.product.stock + item.quantity;
  const newQuantity = Math.min(requested, ceiling);
  const delta = newQuantity - item.quantity;
  if (delta === 0) return;

  await prisma.$transaction([
    prisma.orderItem.update({ where: { id: itemId }, data: { quantity: newQuantity } }),
    prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: delta } },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: { increment: delta * item.unitPrice } },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function removeOrderItem(orderId: string, itemId: string) {
  await verifyAdmin();

  const [order, itemCount, item] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId } }),
    prisma.orderItem.count({ where: { orderId } }),
    prisma.orderItem.findUnique({ where: { id: itemId } }),
  ]);
  if (!order || order.status !== ITEMS_EDITABLE_STATUS) return;
  if (!item || item.orderId !== orderId) return;
  // An order needs at least one item — removing the last one should go
  // through "Mark declined" instead, not leave an empty order behind.
  if (itemCount <= 1) return;

  await prisma.$transaction([
    prisma.orderItem.delete({ where: { id: itemId } }),
    prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: { decrement: item.quantity * item.unitPrice } },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function createProductManually(
  _prevState: ManualProductFormState,
  formData: FormData
): Promise<ManualProductFormState> {
  await verifyAdmin();

  const validatedFields = ManualProductFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    saleEndsAt: formData.get("saleEndsAt"),
    stock: formData.get("stock"),
    brand: formData.get("brand"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  const data = validatedFields.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return { message: "Please choose a valid category." };
  }

  const baseSlug = slugify(data.name);
  if (!baseSlug) {
    return { errors: { name: ["Please enter a name with at least one letter or number."] } };
  }
  let slug = baseSlug;
  let suffix = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  // A manually-supplied imageUrl is the only photo we have for this product
  // — never padded with unrelated auto-fetched extras. Auto-fetch (a real
  // multi-photo gallery) only kicks in when the admin left it blank.
  const images = data.imageUrl ? [data.imageUrl] : await findProductImages(data.name, slug, 4);

  await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      // Only meaningful alongside an actual discount — ignored otherwise so
      // a countdown can never appear on a product that isn't on sale.
      saleEndsAt: data.compareAtPrice && data.saleEndsAt ? new Date(data.saleEndsAt) : null,
      stock: data.stock,
      brand: data.brand,
      imageUrl: images[0],
      images,
      categoryId: category.id,
    },
  });

  revalidatePath("/admin/products/new");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
  return { message: `"${data.name}" was added.` };
}
