"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";
import { slugify } from "@/lib/slugify";
import { findProductImages } from "@/lib/product-image";
import { getCallService } from "@/lib/calls";
import { triggerCourierParcel } from "@/lib/confirm-order";
import { getCourierService } from "@/lib/courier";
import { findRealProducts } from "@/lib/product-search";
import { reVerifyProductSource } from "@/lib/product-search/reverify";
import { setMarkupSetting } from "@/lib/settings";
import {
  CheckoutFormSchema,
  type CheckoutFormState,
  ManualProductFormSchema,
  type ManualProductFormState,
  MarkupSettingSchema,
  type MarkupSettingFormState,
  VettedRetailerFormSchema,
  type VettedRetailerFormState,
} from "@/lib/definitions";

// Order statuses where the shipment is either already gone or the order is
// dead — editing shipping info at that point wouldn't reach anyone.
const SHIPPING_INFO_LOCKED_STATUSES = ["DECLINED", "CANCELLED"];
// Line items are only editable before the customer has confirmed — once
// CONFIRMED, courier dispatch is already in motion off of that item list.
const ITEMS_EDITABLE_STATUS = "PENDING_CONFIRMATION";

const CANDIDATE_COUNT = 6;
const DEFAULT_STOCK = 20;

export type FindTrendingState =
  | { success: true; warning?: string }
  | { error: string }
  | undefined;

export async function findTrendingProducts(
  _prevState: FindTrendingState,
  formData: FormData
): Promise<FindTrendingState> {
  await verifyAdmin();

  const categoryId = String(formData.get("categoryId") ?? "");
  const category = categoryId ? await prisma.category.findUnique({ where: { id: categoryId } }) : null;
  if (!category) return { error: "Please choose a category." };

  const [activeProducts, pendingProducts] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { name: true, slug: true } }),
    prisma.pendingProduct.findMany({ where: { status: "PENDING" }, select: { name: true, slug: true } }),
  ]);
  const existingSlugs = new Set([
    ...activeProducts.map((p) => p.slug),
    ...pendingProducts.map((p) => p.slug),
  ]);
  const existingNames = [...activeProducts, ...pendingProducts].map((p) => p.name);

  let result;
  try {
    result = await findRealProducts(category.id, CANDIDATE_COUNT, existingNames);
  } catch (error) {
    console.error("findTrendingProducts: search failed:", error);
    const detail = error instanceof Error ? error.message : "unknown error";
    return {
      error: `Every search provider failed or timed out (${detail}) — this usually means a free-tier quota is exhausted or a provider is temporarily overloaded. Try again shortly, or add a paid OPENAI_API_KEY/ANTHROPIC_API_KEY for a more reliable search.`,
    };
  }
  const { candidates, usedFallback, fallbackReason } = result;

  for (const candidate of candidates) {
    const slug = slugify(candidate.name);
    if (!slug || existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);

    // Real finds already carry an exact product photo — only the brainstorm
    // fallback (no imageUrl of its own) needs a keyword image search.
    const images = candidate.sourceUrl
      ? [candidate.imageUrl]
      : await findProductImages(candidate.name, slug, 4);

    await prisma.pendingProduct.create({
      data: {
        name: candidate.name,
        slug,
        description: candidate.description,
        price: candidate.price,
        imageUrl: images[0],
        images,
        brand: candidate.brand,
        categoryId: category.id,
        sourceUrl: candidate.sourceUrl,
        sourceDomain: candidate.sourceDomain,
        realPrice: candidate.realPrice,
        isSubstitute: candidate.isSubstitute,
      },
    });
  }

  revalidatePath("/admin");
  return usedFallback
    ? { success: true, warning: `Showed AI-brainstormed suggestions, not a real search: ${fallbackReason}` }
    : { success: true };
}

function pendingProductCreateData(pending: {
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  brand: string;
  categoryId: string;
  sourceUrl: string | null;
  sourceDomain: string | null;
  realPrice: number | null;
  isSubstitute: boolean;
}) {
  return {
    name: pending.name,
    slug: pending.slug,
    description: pending.description,
    price: pending.price,
    imageUrl: pending.imageUrl,
    images: pending.images,
    brand: pending.brand,
    stock: DEFAULT_STOCK,
    categoryId: pending.categoryId,
    sourceUrl: pending.sourceUrl,
    sourceDomain: pending.sourceDomain,
    realPrice: pending.realPrice,
    isSubstitute: pending.isSubstitute,
  };
}

// formData carries the (possibly admin-edited) price/description from the
// review card's inline-edit fields (idea 16) — falls back to the stored
// candidate values when left blank/invalid, so one submit both edits and
// approves in a single step.
export async function approveProduct(id: string, formData: FormData) {
  await verifyAdmin();

  const pending = await prisma.pendingProduct.findUnique({ where: { id } });
  if (!pending || pending.status !== "PENDING") return;

  const editedPrice = Number(formData.get("price"));
  const price = Number.isFinite(editedPrice) && editedPrice > 0 ? Math.round(editedPrice) : pending.price;

  const editedDescription = formData.get("description");
  const description =
    typeof editedDescription === "string" && editedDescription.trim().length >= 10
      ? editedDescription.trim()
      : pending.description;

  await prisma.$transaction([
    prisma.product.create({
      data: pendingProductCreateData({ ...pending, price, description }),
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

// First multi-select pattern in the admin UI (idea 15) — a dynamic id array
// doesn't fit the static per-row .bind() pattern used everywhere else, so
// the client calls these directly via startTransition rather than a <form>.
export async function bulkApproveProducts(ids: string[]) {
  await verifyAdmin();
  if (ids.length === 0) return;

  const pendingList = await prisma.pendingProduct.findMany({
    where: { id: { in: ids }, status: "PENDING" },
  });
  if (pendingList.length === 0) return;

  await prisma.$transaction([
    ...pendingList.map((p) => prisma.product.create({ data: pendingProductCreateData(p) })),
    prisma.pendingProduct.updateMany({
      where: { id: { in: pendingList.map((p) => p.id) } },
      data: { status: "APPROVED", reviewedAt: new Date() },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function bulkRejectProducts(ids: string[]) {
  await verifyAdmin();
  if (ids.length === 0) return;

  await prisma.pendingProduct.updateMany({
    where: { id: { in: ids }, status: "PENDING" },
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

// Edits any live product's core fields (idea: full product-edit page). A
// blank imageUrl leaves the existing photo(s) alone — unlike the
// manual-add form, blank here should never trigger an unrelated auto-fetch
// on an existing product.
export async function updateProduct(
  id: string,
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

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      saleEndsAt: data.compareAtPrice && data.saleEndsAt ? new Date(data.saleEndsAt) : null,
      stock: data.stock,
      brand: data.brand,
      categoryId: category.id,
      ...(data.imageUrl ? { imageUrl: data.imageUrl, images: [data.imageUrl] } : {}),
    },
  });

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { message: "Product updated." };
}

export type ReVerifyState = { message: string } | undefined;

// Re-checks a sourced product's real listing (idea 22) — updates the stored
// realPrice/lastVerifiedAt/sourceCheckStatus but per the confirmed decision
// NEVER touches the live customer-facing `price` automatically; a detected
// change is only surfaced as a message for the admin to act on manually.
export async function reVerifySourcedProduct(id: string): Promise<ReVerifyState> {
  await verifyAdmin();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { message: "Product not found." };
  if (!product.sourceUrl) return { message: "This product has no source to re-verify." };

  let result;
  try {
    result = await reVerifyProductSource(product.sourceUrl);
  } catch (error) {
    console.error(`reVerifySourcedProduct failed for ${id}:`, error);
    return { message: "Re-verify failed — try again shortly." };
  }

  if (!result) {
    await prisma.product.update({
      where: { id },
      data: { sourceCheckStatus: "unavailable", lastVerifiedAt: new Date() },
    });
    revalidatePath(`/admin/products/${id}`);
    return { message: "Could not find this product at its source anymore — it may be delisted." };
  }

  const priceChanged = result.realPrice !== product.realPrice;
  await prisma.product.update({
    where: { id },
    data: {
      realPrice: result.realPrice,
      lastVerifiedAt: new Date(),
      sourceCheckStatus: priceChanged ? "price_changed" : "ok",
    },
  });
  revalidatePath(`/admin/products/${id}`);

  return priceChanged
    ? {
        message: `Real price changed: ${product.realPrice ?? "?"}৳ → ${result.realPrice}৳. Live price (${product.price}৳) was NOT changed — edit the product if you want to update it.`,
      }
    : { message: "Verified — no change detected." };
}

export async function markProductOutOfStock(id: string) {
  await verifyAdmin();

  await prisma.product.update({ where: { id }, data: { stock: 0 } });

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

// Fulfillment checklist step 1 (idea 20) — the other two steps ("tracking
// entered", "shipped") are read directly off existing Order fields, no
// action needed for those.
export async function markItemSourced(orderId: string, itemId: string) {
  await verifyAdmin();

  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== orderId) return;

  await prisma.orderItem.update({ where: { id: itemId }, data: { sourceOrderedAt: new Date() } });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateMarkupSetting(
  _prevState: MarkupSettingFormState,
  formData: FormData
): Promise<MarkupSettingFormState> {
  await verifyAdmin();

  const validated = MarkupSettingSchema.safeParse({
    mode: formData.get("mode"),
    value: formData.get("value"),
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  await setMarkupSetting(validated.data);
  revalidatePath("/admin/settings");
  return { message: "Markup rule updated. Only new candidates found from now on will use it." };
}

export async function addVettedRetailer(
  _prevState: VettedRetailerFormState,
  formData: FormData
): Promise<VettedRetailerFormState> {
  await verifyAdmin();

  const validated = VettedRetailerFormSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain"),
    categoryId: formData.get("categoryId"),
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const category = await prisma.category.findUnique({ where: { id: validated.data.categoryId } });
  if (!category) return { message: "Please choose a valid category." };

  try {
    await prisma.vettedRetailer.create({
      data: { name: validated.data.name, domain: validated.data.domain, categoryId: category.id },
    });
  } catch {
    return { message: "That domain is already in the list." };
  }

  revalidatePath("/admin/settings");
  return { message: `"${validated.data.name}" added.` };
}

// Deactivate rather than delete (safer, reversible) — the settings page
// toggles this per row.
export async function toggleRetailerActive(id: string, active: boolean) {
  await verifyAdmin();

  await prisma.vettedRetailer.update({ where: { id }, data: { active } });
  revalidatePath("/admin/settings");
}
